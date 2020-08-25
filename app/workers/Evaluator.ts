import { AssetService } from "../services/AssetService";
import { DBService } from "../services/DatabaseService";
import * as TA from "../utilities/TAUtils";

export class Evaluator {

    private assetService: AssetService;
    private dbService: DBService;

    constructor() {
        if (!this.assetService) {
            this.assetService = new AssetService();
        }
        if (!this.dbService) {
            this.dbService = new DBService();
        }
    }

    public retrieveAndEvaluateAssetInfo() {
        return this.retrieveCurrentAssetInfo().then(assetInfo => this.evaluateAssetInfo(assetInfo)).then(value => this.storeAssetInfo(value));
    }

    private retrieveCurrentAssetInfo() {
        return this.assetService.getTicker();
    }

    private evaluateAssetInfo(info: any) {
        console.log(info);
        return info;
    }

    private storeAssetInfo(info) {
        return this.dbService.storeEvaluation(info, "btc");
    }

}