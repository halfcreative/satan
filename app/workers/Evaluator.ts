import { AssetService } from "../services/AssetService";
import { DBService } from "../services/DatabaseService";
import { ContextModel } from "../models/ContextModel";
import { Evaluation, Indicators, MACD, PortfolioState } from "../models/EvaluationModel";
import { OrderParams } from "coinbase-pro";
import * as CONSTANTS from "../constants/constants";
import * as TA from "../utilities/TAUtils";

export class Evaluator {

    private assetService: AssetService;
    private dbService: DBService;

    constructor(assetService: AssetService, dbService: DBService) {
        this.assetService = assetService;
        this.dbService = dbService;
    }

    public evaluateAssetAndStoreEvaluation(currency: string, context: ContextModel): Promise<Evaluation> {
        const evaluation = this.generateFullEvaluation(currency, context);
        return this.storeEvaluation(currency, evaluation);
    }

    private generateFullEvaluation(currency: string, context: ContextModel): Evaluation {
        console.info("Generating Evaluation");
        const evaluation = new Evaluation();
        evaluation.price = parseFloat(context.ticker.price);
        evaluation.indicators = this.calculateIndicators(context);
        evaluation.orders = this.determineActions();
        evaluation.portfolioState = this.evalutateAccountState(currency, context);
        return evaluation;
    }

    private calculateIndicators(context: ContextModel): Indicators {
        console.info("Calculating Indicators");
        const indicators = new Indicators();
        const closingHistory = this.assetService.singleSetHistory(context.history, 4); // get only the history of closing values

        indicators.sma50 = TA.sma(closingHistory, 50);
        indicators.sma20 = TA.sma(closingHistory, 20);
        indicators.ema12 = TA.ema(closingHistory, 12)[0];
        indicators.ema26 = TA.ema(closingHistory, 26)[0];
        indicators.rsi14 = TA.rsi(closingHistory, 14);

        const macd = TA.macd(closingHistory, 20);
        const macdSignal = TA.macdSignal(macd);
        indicators.macd = context.lastEval ? new MACD(macd[0], macdSignal[0], context.lastEval.indicators.macd) : new MACD(macd[0], macdSignal[0]);

        return indicators;
    }

    private determineActions(): Array<OrderParams> {
        const orders: Array<OrderParams> = [];
        return orders;
    }

    private storeEvaluation(currency: string, evaluation: Evaluation): Promise<Evaluation> {
        return this.dbService.storeEvaluation(currency, evaluation);
    }

    private evalutateAccountState(currency: string, context: ContextModel) {
        console.info("-- Evaluating Account Info --");
        console.info("Accounts : ", context.accounts);
        let portfolioValue: number = 0;
        for (const account of context.accounts) {
            let balance: number = parseFloat(account.balance);
            if (account.currency == CONSTANTS.USD) {
                console.info("Account (USD) :");
                portfolioValue += parseFloat(parseFloat(account.balance).toFixed(8));
                console.info(` >balance - ${account.balance}(${account.currency})`);
            } else if ((account.currency + '-' + CONSTANTS.USD) == currency) {
                console.info("Account (" + account.currency + ") :");
                console.info(` >balance - ${account.balance}(${account.currency})`);
                portfolioValue += parseFloat(
                    (parseFloat(account.balance) * parseFloat(context.ticker.price)).toFixed(8));
                console.info(` >balance in usd - ${parseFloat(account.balance) * parseFloat(context.ticker.price)}`);
            }
        }
        return new PortfolioState(portfolioValue, context.accounts);
    }
}