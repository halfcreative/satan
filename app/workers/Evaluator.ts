import { AssetService } from "../services/AssetService";
import { DBService } from "../services/DatabaseService";
import { ContextModel } from "../models/ContextModel";
import { Evaluation, Indicators, MACD, PortfolioState } from "../models/EvaluationModel";
import { Account, LimitOrder, MarketOrder, OrderParams, ProductTicker } from "coinbase-pro";
import * as CONSTANTS from "../constants/constants";
import * as TA from "../utilities/TAUtils";
import { constants } from "buffer";

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
        evaluation.portfolioState = this.evalutatePortfolioState(currency, context);
        evaluation.orders = this.determineActions(currency, context, evaluation.indicators, evaluation.portfolioState);
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

    private evalutatePortfolioState(currency: string, context: ContextModel) {
        console.info("-- Evaluating Account Info --");
        console.info("Accounts : ", context.accounts);
        let portfolioValue: number = 0;
        for (const account of context.accounts) {
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

    private storeEvaluation(currency: string, evaluation: Evaluation): Promise<Evaluation> {
        return this.dbService.storeEvaluation(currency, evaluation);
    }

    /**
         * Calculates the size of an order to place.
         *
         * @private
         * @param {number} accountValue
         * @param {Array<Account>} accounts
         * @param {String} currency
         * @param {ProductTicker} ticker
         * @returns {String}
         * @memberof Evaluator
         */
    private calculateOrderSize(currency: String, context: ContextModel, portfolioState: PortfolioState): string {
        const riskAmount: number = CONSTANTS.RISK_PERCENT * portfolioState.totalValue;
        const maxOrderSize: number =
            (riskAmount * CONSTANTS.REWARD_RISK_RATIO) /
            CONSTANTS.EXPECTABLE_CHANGE;
        const accountInQuestion: Array<Account> = context.accounts.filter(account => account.currency == currency);
        let orderSize: string;
        if (accountInQuestion.length > 0) {
            const account: Account = accountInQuestion[0];
            if (currency == CONSTANTS.USD) {
                if (maxOrderSize > parseFloat(account.balance)) {
                    orderSize = parseFloat(account.balance).toFixed(
                        CONSTANTS.USD_PRECISION
                    );
                } else {
                    orderSize = maxOrderSize.toFixed(
                        CONSTANTS.USD_PRECISION
                    );
                }
            } else {
                if (
                    maxOrderSize / parseFloat(context.ticker.price) >
                    parseFloat(account.balance)
                ) {
                    orderSize = parseFloat(account.balance).toFixed(
                        CONSTANTS.BTC_PRECISION
                    );
                } else {
                    orderSize = (
                        maxOrderSize / parseFloat(context.ticker.price)
                    ).toFixed(CONSTANTS.BTC_PRECISION);
                }
            }
        }
        return orderSize;
    }

    /**
     * Calculates where to place stop loss limit order price point.
     * expectable change is a percent based on observation, how much we might expect the bitcoin price to move.
     * The expectable change is an observation of growth, and helps determine the order size.
     * following that ordersize is crafted by deviding the ideal reward for the trade(2x the risk) by the percent we expect the price to change by
     * we know that to prevent more than the risk amount we place the limit price at half the expectable change
     *
     * @private
     * @param {ProductTicker} ticker
     * @returns {string}
     * @memberof Evaluator
     */
    private calculateStopLossLimitOrderPricePoint(
        ticker: ProductTicker
    ): string {
        return (
            parseFloat(ticker.price) -
            parseFloat(ticker.price) *
            (CONSTANTS.EXPECTABLE_CHANGE / CONSTANTS.REWARD_RISK_RATIO)
        ).toFixed(CONSTANTS.USD_PRECISION);
    }

    /**
     *
     *
     * @private
     * @param {ProductTicker} ticker
     * @param {Indicators} indicators
     * @param {Array<Account>} accounts
     * @param {AccountState} accountState
     * @returns {Array<OrderParams>} Array of orders. empty array if no order to be placed.
     * @memberof Evaluator
     */
    private determineActions(currency: string, context: ContextModel, indicators: Indicators, portfolioState: PortfolioState,): Array<OrderParams> {
        let orders: Array<OrderParams> = [];
        const macdActionSignal = this.evaluateMACD(indicators);
        if (macdActionSignal == CONSTANTS.BUY) {
            const orderSize = this.calculateOrderSize(CONSTANTS.USD, context, portfolioState);
            const orderSizeNumber = parseFloat(orderSize);
            const limitOrderSize = (
                orderSizeNumber / parseFloat(context.ticker.price)
            ).toFixed(CONSTANTS.BTC_PRECISION);
            const marketOrder = {
                type: CONSTANTS.MARKET_ORDER,
                side: CONSTANTS.BUY,
                funds: orderSize,
                product_id: currency
            } as MarketOrder;
            const stopLossLimitOrder = {
                type: CONSTANTS.LIMIT_ORDER,
                side: CONSTANTS.SELL,
                price: this.calculateStopLossLimitOrderPricePoint(context.ticker),
                stop_price: this.calculateStopLossLimitOrderPricePoint(context.ticker),
                size: limitOrderSize,
                product_id: currency,
                stop: "loss"
            } as LimitOrder;
            if (
                parseFloat(orderSize) > CONSTANTS.USD_MINIMUM &&
                orderSizeNumber < CONSTANTS.USD_MAXIMUM
            ) {
                orders.push(marketOrder);
                orders.push(stopLossLimitOrder);
            }
        } else if (macdActionSignal == CONSTANTS.SELL) {
            const orderSize = this.calculateOrderSize(currency.split('-')[0], context, portfolioState);
            const orderSizeNumber = parseFloat(orderSize);
            const sellOrder = {
                type: CONSTANTS.MARKET_ORDER,
                side: CONSTANTS.SELL,
                size: orderSize,
                product_id: currency
            } as MarketOrder;
            if (
                parseFloat(orderSize) > CONSTANTS.BTC_MINIMUM &&
                orderSizeNumber < CONSTANTS.BTC_MAXIMUM
            ) {
                orders.push(sellOrder);
            }
        }

        return orders;
    }

    private evaluateMACD(indicators: Indicators) {
        return CONSTANTS.NA;

    }

}