import { Callback } from "aws-lambda";
import { AssetService } from "../services/AssetService";
import { Evaluator } from "./Evaluator";
import { Executor } from "./Executor";

export class EventHandler {

    private evaluator: Evaluator;
    private executor: Executor;

    constructor() {
    }

    public initCodeFlow(event: any, callback: Callback) {
        console.info(`Event Recieved : ${JSON.stringify(event)}`);
        this.autoFlow(callback);
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
        this.evaluator.retrieveAndEvaluateAssetInfo().then(ticker => {
            callback(null, ticker);
        }).catch(error => {
            callback(error);
        });
    }

    /**
     * runs the code sequence for user-command events.
     */
    private commandFlow() {

    }

}