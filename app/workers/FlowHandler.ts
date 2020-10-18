import { Callback } from "aws-lambda";
import { AssetService } from "../services/AssetService";
import { Evaluator } from "./Evaluator";
import { Executor } from "./Executor";
import * as CONSTANTS from '../constants/constants';
import { Aggregator } from "./InfoAggregator";
import { DBService } from "../services/DatabaseService";

export class FlowHandler {

    private dbService: DBService;
    private assetService: AssetService;

    private aggregator: Aggregator;
    private evaluator: Evaluator;
    private executor: Executor;


    constructor() {
        this.dbService = new DBService();
        this.assetService = new AssetService();
    }

    /**
     * Determines the code flow to initiate based on the event.
     * Command calls to the API will result in the "Command" flow
     * Chron calls from cloudwatch will result in the "Automated" flow
     * 
     * @param event The event that initiated this lambda call
     * @param callback Callback function to end the lambda.
     */
    public initCodeFlow(event: any, callback: Callback) {
        console.info(`Event Recieved : ${JSON.stringify(event)}`);
        if (this.commandEventCheck(event)) {
            this.commandFlow();
        } else {
            this.autoFlow(callback);
        }
    }

    /**
     * runs the code sequence for automated analysis.
     */
    private autoFlow(callback: Callback): void {
        // Initiate the worker classes if not already present
        if (!this.aggregator) {
            this.aggregator = new Aggregator(this.assetService, this.dbService);
        }
        if (!this.evaluator) {
            this.evaluator = new Evaluator(this.assetService, this.dbService);
        }
        if (!this.executor) {
            this.executor = new Executor(this.assetService, this.dbService);
        }
        // Automatic flow is as follows : gather context -> evaluate asset -> execute evaluation
        this.aggregator.gatherAssetInfo(CONSTANTS.BTCUSD).then(context => {
            return this.evaluator.evaluateAssetAndStoreEvaluation(CONSTANTS.BTCUSD, context);
        }).then(evaluation => {
            return this.executor.executeOrderFromEvaluation(evaluation);
        }).then(orderResults => {
            callback(null, orderResults);
        }).catch(error => {
            callback(error);
        })
    }

    /**
     * runs the code sequence for user-command events.
     */
    private commandFlow() {
        if (!this.executor) {
            this.executor = new Executor(this.assetService, this.dbService);
        }
        console.log("Initiating External Command");

    }

    private commandEventCheck(event: any) {
        if (event.source && event.source == "aws.events") {
            return false;
        }
        return true;
    }

}