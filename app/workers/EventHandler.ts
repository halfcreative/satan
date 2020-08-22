import { Callback } from "aws-lambda";
import { AssetService } from "../services/AssetService";

export class EventHandler {

    private assetService: AssetService;

    constructor() {
        this.assetService = new AssetService();
    }

    public initCodeFlow(event: any, callback: Callback) {
        console.info(`Event Recieved : ${event}`);
        this.autoFlow(callback);
    }


    /**
     * runs the code sequence for automated analysis.
     */
    private autoFlow(callback: Callback) {
        this.assetService.getTicker().then(ticker => {
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