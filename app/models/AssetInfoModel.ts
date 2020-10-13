import { ProductTicker } from "coinbase-pro";
import { Evaluation } from "./EvaluationModel";

export class AssetInformationModel {
    public ticker: ProductTicker;
    public history: Array<Array<number>>;
    public lastEval: Evaluation;

    constructor(ticker: ProductTicker, history: Array<Array<number>>, lastEvaluation: Evaluation) {
        this.ticker = ticker;
        this.history = history;
        this.lastEval = lastEvaluation;
    }
}