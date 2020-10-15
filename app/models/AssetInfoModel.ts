import { Account, ProductTicker } from "coinbase-pro";
import { Evaluation } from "./EvaluationModel";

export class AssetInformationModel {
    public ticker: ProductTicker;
    public history: Array<Array<number>>;
    public lastEval: Evaluation;
    public accounts: Array<Account>;

    constructor(ticker: ProductTicker, history: Array<Array<number>>, lastEvaluation: Evaluation, accounts: Array<Account>) {
        this.ticker = ticker;
        this.history = history;
        this.lastEval = lastEvaluation;
        this.accounts = accounts;
    }
}