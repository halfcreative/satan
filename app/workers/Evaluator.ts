import { AssetService } from "../services/AssetService";
import { DBService } from "../services/DatabaseService";
import * as TA from "../utilities/TAUtils";
import { AssetInformationModel } from "models/AssetInfoModel";

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

    public retrieveAndEvaluateAssetInfo(currency: string) {
        return this.retrieveCurrentAssetInfo(currency).then(assetInfo => this.evaluateAssetInfo(assetInfo)).then(value => this.storeEvaluation(value));
    }

    /**
     * 
     * @param currency The currency to retrieve info for
     * @returns {AssetInformationModel} 
     */
    private retrieveCurrentAssetInfo(currency: string): Promise<AssetInformationModel> {
        return Promise.all([this.assetService.getTicker(currency), this.assetService.getHistory(currency, 100)]).then(values => {
            return new AssetInformationModel(values[0], values[1]);
        });
    }

    private evaluateAssetInfo(info: AssetInformationModel) {
        console.log(info);

        return info;
    }

    private storeEvaluation(info) {
        return this.dbService.storeEvaluation(info, "btc");
    }

}