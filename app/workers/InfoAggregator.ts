import { AssetService } from "../services/AssetService";
import { DBService } from "../services/DatabaseService";
import { AssetInformationModel } from "../models/AssetInfoModel";

export class Aggregator {
    private assetService: AssetService;
    private dbService: DBService
    constructor(assetService: AssetService, dbService: DBService) {
        this.assetService = assetService;
        this.dbService = dbService;
    }

    /**
     * Retrieves information for the ticker, price history and the most recent evaluation of the asset in question.
     * returns an AssetInformationModel containing the 3 values.
     * @param asset The asset to be gathering information for
     */
    public gatherAssetInfo(asset: string): Promise<AssetInformationModel> {
        return Promise.all([this.assetService.getTicker(asset), this.assetService.getHistory(asset, 100), this.dbService.getMostRecentEvaluation(asset)]).then(values => {
            return new AssetInformationModel(values[0], values[1], values[2]);
        });
    }

}