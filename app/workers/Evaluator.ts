import { AssetService } from "../services/AssetService";
import { DBService } from "../services/DatabaseService";
import * as TA from "../utilities/TAUtils";
import { AssetInformationModel } from "../models/AssetInfoModel";
import { Evaluation, Indicators, MACD } from "../models/EvaluationModel";

export class Evaluator {

    private assetService: AssetService;
    private dbService: DBService;

    constructor(assetService: AssetService, dbService: DBService) {
        this.assetService = assetService;
        this.dbService = dbService;
    }

    public evaluateAssetAndStoreEvaluation(currency: string, assetInfo: AssetInformationModel): Promise<Evaluation> {
        const evaluation = this.generateFullEvaluation(assetInfo);
        return this.storeEvaluation(currency, evaluation);
    }

    private generateFullEvaluation(info: AssetInformationModel): Evaluation {
        console.info("Generating Evaluation");
        const evaluation = new Evaluation();
        evaluation.price = parseFloat(info.ticker.price);
        evaluation.indicators = this.calculateIndicators(info);
        return evaluation;
    }

    private calculateIndicators(assetInfo: AssetInformationModel): Indicators {
        console.info("Calculating Indicators");
        const indicators = new Indicators();
        const closingHistory = this.assetService.singleSetHistory(assetInfo.history, 4); // get only the history of closing values

        indicators.sma50 = TA.sma(closingHistory, 50);
        indicators.sma20 = TA.sma(closingHistory, 20);
        indicators.ema12 = TA.ema(closingHistory, 12)[0];
        indicators.ema26 = TA.ema(closingHistory, 26)[0];
        indicators.rsi14 = TA.rsi(closingHistory, 14);

        const macd = TA.macd(closingHistory, 20);
        const macdSignal = TA.macdSignal(macd);
        indicators.macd = assetInfo.lastEval ? new MACD(macd[0], macdSignal[0], assetInfo.lastEval.indicators.macd) : new MACD(macd[0], macdSignal[0]);

        return indicators;
    }

    private storeEvaluation(currency: string, evaluation: Evaluation): Promise<Evaluation> {
        return this.dbService.storeEvaluation(currency, evaluation);
    }

}