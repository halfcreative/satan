import { AssetService } from "../services/AssetService";
import { DBService } from "../services/DatabaseService";
import * as TA from "../utilities/TAUtils";
import { AssetInformationModel } from "../models/AssetInfoModel";
import { Evaluation, Indicators, MACD } from "../models/EvaluationModel";

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

    public retrieveAndEvaluateAssetInfo(currency: string): Promise<Evaluation> {
        return this.retrieveCurrentAssetInfo(currency).then(
            assetInfo => this.evaluateAssetInfo(assetInfo)).then(
                evaluation => this.storeEvaluation(evaluation, currency));
    }

    /**
     * 
     * @param currency The currency to retrieve info for
     * @returns {AssetInformationModel} 
     */
    private retrieveCurrentAssetInfo(currency: string): Promise<AssetInformationModel> {
        // TODO : ALSO GRAB LAST EVALUATION AND EVALUATIONS OF YESTERDAY, 3DAYS AGO, 5DAYS AGO, 10DAYS AGO, and 1MONTH AGO
        return Promise.all([this.assetService.getTicker(currency), this.assetService.getHistory(currency, 100), this.dbService.getMostRecentEvaluation(currency)]).then(values => {
            console.log("values retrieved ", values[2]);
            return new AssetInformationModel(values[0], values[1], values[2]);
        });
    }

    private evaluateAssetInfo(info: AssetInformationModel): Evaluation {
        console.log("Asset Info Model", info.lastEval);
        const evaluation = new Evaluation();
        evaluation.price = parseFloat(info.ticker.price);
        const closingHistory = this.assetService.singleSetHistory(info.history, 4) // get only the history of closing values
        // const macd = new MACD();
        evaluation.indicators = new Indicators();

        evaluation.indicators.sma50 = TA.sma(closingHistory, 50);
        evaluation.indicators.sma20 = TA.sma(closingHistory, 20);
        evaluation.indicators.ema12 = TA.ema(closingHistory, 12)[0];
        evaluation.indicators.ema26 = TA.ema(closingHistory, 26)[0];
        evaluation.indicators.rsi14 = TA.rsi(closingHistory, 14);

        const macd = TA.macd(closingHistory, 20);
        const macdSignal = TA.macdSignal(macd);


        evaluation.indicators.macd = info.lastEval ? new MACD(macd[0], macdSignal[0], info.lastEval.indicators.macd) : new MACD(macd[0], macdSignal[0]);

        return evaluation;
    }

    private storeEvaluation(info, currency): Promise<Evaluation> {
        return this.dbService.storeEvaluation(info, currency);
    }

}