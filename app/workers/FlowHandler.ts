import { AssetService } from "../services/AssetService";
import { Evaluator } from "./Evaluator";
import { Executor } from "./Executor";
import * as CONSTANTS from '../constants/constants';
import { Aggregator } from "./InfoAggregator";
import { DBService } from "../services/DatabaseService";
import { NotificationService } from "../services/NotificationService";
import { Auditor } from "./Auditor";

export class FlowHandler {

    private dbService: DBService;
    private assetService: AssetService;
    private notificationService: NotificationService;

    private aggregator: Aggregator;
    private evaluator: Evaluator;
    private executor: Executor;
    private auditor: Auditor;

    constructor() {
        this.dbService = new DBService();
        this.assetService = new AssetService();
        this.notificationService = new NotificationService();
    }

    /**
     * Determines the code flow to initiate based on the event.
     * Command calls to the API will result in the "Command" flow
     * Chron calls from cloudwatch will result in the "Automated" flow
     * 
     * @param event The event that initiated this lambda call
     * @param callback Callback function to end the lambda.
     */
    public initCodeFlow(event: any) {
        console.info(`Event Recieved : ${JSON.stringify(event)}`);
        if (this.commandEventCheck(event)) {
            return this.commandFlow();
        } else {
            return this.autoFlow();
        }
    }

    /**
     * runs the code sequence for automated analysis.
     */
    private autoFlow() {
        // Initiate the worker classes if not already present
        if (!this.aggregator) {
            this.aggregator = new Aggregator(this.assetService, this.dbService);
        }
        if (!this.evaluator) {
            this.evaluator = new Evaluator(this.assetService);
        }
        if (!this.executor) {
            this.executor = new Executor(this.assetService, this.dbService, this.notificationService);
        }
        if (!this.auditor) {
            this.auditor = new Auditor(this.dbService);
        }
        // Automatic flow is as follows : gather context -> evaluate asset -> execute evaluation
        return this.aggregator.gatherAssetInfo(CONSTANTS.BTCUSD).then(context => {
            return this.evaluator.generateFullEvaluation(CONSTANTS.BTCUSD, context);
        }).then(evaluation => {
            return this.executor.executeOrderFromEvaluation(evaluation);
        }).then(evaluation => {
            return this.auditor.runAudit(evaluation);
        }).then(evaluation => {
            return evaluation;
        }).catch(error => {
            return error;
        })
    }

    /**
     * runs the code sequence for user-command events.
     */
    private commandFlow() {
        if (!this.executor) {
            this.executor = new Executor(this.assetService, this.dbService, this.notificationService);
        }
        console.log("Initiating External Command");
        return true;

    }

    private commandEventCheck(event: any) {
        if (event) {
            if (event.source && event.source == "aws.events") {
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

}
