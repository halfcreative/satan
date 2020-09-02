import { Callback } from "aws-lambda";
import { AssetService } from "../services/AssetService";
import { Evaluator } from "./Evaluator";
import { Executor } from "./Executor";
import * as CONSTANTS from '../constants/constants';

export class FlowHandler {

    private evaluator: Evaluator;
    private executor: Executor;

    constructor() {
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
    private autoFlow(callback: Callback) {
        if (!this.evaluator) {
            this.evaluator = new Evaluator();
        }
        if (!this.executor) {
            this.executor = new Executor();
        }
        console.info("Starting Automated Analysis");

        this.evaluator.retrieveAndEvaluateAssetInfo(CONSTANTS.BTCUSD).then(ticker => {
            callback(null, ticker);
        }).catch(error => {
            callback(error);
        });
    }

    /**
     * runs the code sequence for user-command events.
     */
    private commandFlow() {
        if (!this.executor) {
            this.executor = new Executor();
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