import { AssetService } from "../services/AssetService";
import { ContextModel } from "../models/ContextModel";
import { Evaluation, TechnicalAnalysis, MACD, PortfolioState, Trade } from "../models/EvaluationModel";
import { Account, LimitOrder, MarketOrder, ProductTicker } from "coinbase-pro";
import * as CONSTANTS from "../constants/constants";
import * as TAUtils from "../utilities/TAUtils";

export class Evaluator {

    private assetService: AssetService;

    constructor(assetService: AssetService) {
        this.assetService = assetService;
    }

    public generateFullEvaluation(currency: string, context: ContextModel): Evaluation {
        console.info("Generating Evaluation");
        const evaluation = new Evaluation();
        evaluation.currency = currency;
        evaluation.price = parseFloat(context.ticker.price);
        evaluation.technicalAnalysis = this.runTechnicalAnalysis(context);
        evaluation.portfolioState = this.evalutatePortfolioState(currency, context);
        evaluation.trade = this.determineActions(currency, context, evaluation.technicalAnalysis, evaluation.portfolioState);
        return evaluation;
    }

    private runTechnicalAnalysis(context: ContextModel): TechnicalAnalysis {
        console.info("Calculating Indicators");
        const technicalAnalysis = new TechnicalAnalysis();
        const highHistory = this.assetService.singleSetHistory(context.history, 1);
        const lowHistory = this.assetService.singleSetHistory(context.history, 2);
        const closingHistory = this.assetService.singleSetHistory(context.history, 4);
        const volumeHistory = this.assetService.singleSetHistory(context.history, 5);

        technicalAnalysis.sma50 = TAUtils.sma(closingHistory, 50);
        technicalAnalysis.sma20 = TAUtils.sma(closingHistory, 20);
        technicalAnalysis.ema12 = TAUtils.ema(closingHistory, 12)[0];
        technicalAnalysis.ema26 = TAUtils.ema(closingHistory, 26)[0];
        technicalAnalysis.rsi14 = TAUtils.rsi(closingHistory, 14);

        technicalAnalysis.obv = TAUtils.obv(closingHistory, volumeHistory, 50)

        const macd = TAUtils.macd(closingHistory, 20);
        const macdSignal = TAUtils.macdSignal(macd);
        technicalAnalysis.macd = context.lastEval ? new MACD(macd[0], macdSignal[0], context.lastEval.technicalAnalysis.macd) : new MACD(macd[0], macdSignal[0]);

        technicalAnalysis.vi = TAUtils.vi(highHistory, lowHistory, closingHistory, 20);

        technicalAnalysis.ichimokuCloud = TAUtils.ihk(highHistory, lowHistory, closingHistory);

        technicalAnalysis.averageRateOfChange = TAUtils.averageROC(closingHistory, 20, true);

        return technicalAnalysis;
    }

    private evalutatePortfolioState(currency: string, context: ContextModel) {
        console.info("-- Evaluating Account Info --");
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



    /**
     * Calculates the size of an order to place.
     * 
     * @private
     * @param {number} accountValue
     * @param {Array<Account>} accounts
     * @param {string} currency
     * @param {ProductTicker} ticker
     * @returns {string}
     * @memberof Evaluator
     */
    private calculateOrderSize(currency: string, context: ContextModel, portfolioState: PortfolioState): string {
        const riskAmount: number = CONSTANTS.RISK_PERCENT * portfolioState.totalValue;
        const expectableRise: number = TAUtils.averageROC(this.assetService.singleSetHistory(context.history, 4), 20, true);
        const maxOrderSize: number =
            (riskAmount * CONSTANTS.REWARD_RISK_RATIO) /
            expectableRise;
        const accountInQuestion: Array<Account> = context.accounts.filter(account => account.currency == currency);
        let orderSize: string;
        if (accountInQuestion.length > 0) {
            const account: Account = accountInQuestion[0];
            if (currency == CONSTANTS.USD) {
                if (maxOrderSize > parseFloat(account.balance)) {
                    orderSize = (Math.trunc(parseFloat(account.balance) * 100) / 100).toFixed(CONSTANTS.USD_PRECISION);
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
        ticker: ProductTicker,
        technicalAnalysis: TechnicalAnalysis
    ): string {
        return (
            parseFloat(ticker.price) -
            parseFloat(ticker.price) *
            (technicalAnalysis.averageRateOfChange / CONSTANTS.REWARD_RISK_RATIO)
        ).toFixed(CONSTANTS.USD_PRECISION);
    }

    private calculatePriceTarget(
        ticker: ProductTicker,
        technicalAnalysis: TechnicalAnalysis
    ): string {
        return (
            parseFloat(ticker.price) +
            parseFloat(ticker.price) *
            (technicalAnalysis.averageRateOfChange)
        ).toFixed(CONSTANTS.USD_PRECISION);
    }

    /**
     *
     *
     * @private
     * @param {ProductTicker} ticker
     * @param {TechnicalAnalysis} technicalAnalysis
     * @param {Array<Account>} accounts
     * @param {AccountState} accountState
     * @returns {Array<OrderParams>} Array of orders. empty array if no order to be placed.
     * @memberof Evaluator
     */
    private determineActions(currency: string, context: ContextModel, technicalAnalysis: TechnicalAnalysis, portfolioState: PortfolioState,): Trade | null {
        let trade: Trade = null;
        const macdActionSignal = this.evaluateMACD(technicalAnalysis);
        if (macdActionSignal == CONSTANTS.BUY) {
            // buy action
            trade = this.craftTrade(currency, context, portfolioState, technicalAnalysis, true);
        } else if (macdActionSignal == CONSTANTS.SELL) {
            // sell action
            trade = this.craftTrade(currency, context, portfolioState, technicalAnalysis, false);
        } else {
            // no action
        }
        return trade;
    }

    private craftTrade(currency: string, context: ContextModel, portfolioState: PortfolioState, technicalAnalysis: TechnicalAnalysis, buy: boolean): Trade {
        const trade = new Trade();
        trade.orderParams = [];
        if (buy) {
            const orderSize = this.calculateOrderSize(CONSTANTS.USD, context, portfolioState);
            const orderSizeNumber = parseFloat(orderSize);
            if (
                orderSizeNumber > CONSTANTS.BTC_MINIMUM &&
                orderSizeNumber < CONSTANTS.BTC_MAXIMUM
            ) {
                const limitOrderSize = (
                    orderSizeNumber / parseFloat(context.ticker.price)
                ).toFixed(CONSTANTS.BTC_PRECISION);
                const marketOrder = {
                    type: CONSTANTS.MARKET_ORDER,
                    side: CONSTANTS.BUY,
                    funds: orderSize,
                    product_id: currency
                } as MarketOrder;
                const stopLossOrder = {
                    type: CONSTANTS.LIMIT_ORDER,
                    side: CONSTANTS.SELL,
                    price: this.calculateStopLossLimitOrderPricePoint(context.ticker, technicalAnalysis),
                    stop_price: this.calculateStopLossLimitOrderPricePoint(context.ticker, technicalAnalysis),
                    size: limitOrderSize,
                    product_id: currency,
                    stop: "loss"
                } as LimitOrder;
                const priceTargetOrder = {
                    type: CONSTANTS.LIMIT_ORDER,
                    side: CONSTANTS.SELL,
                    price: this.calculatePriceTarget(context.ticker, technicalAnalysis),
                    stop_price: this.calculatePriceTarget(context.ticker, technicalAnalysis),
                    size: limitOrderSize,
                    product_id: currency,
                    stop: "entry"
                } as LimitOrder;
                trade.orderParams.push(marketOrder);
                trade.orderParams.push(stopLossOrder);
                trade.orderParams.push(priceTargetOrder);
            }
        } else {
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
                trade.orderParams.push(sellOrder);
            }
        }


        return trade;
    }

    private evaluateMACD(technicalAnalysis: TechnicalAnalysis) {
        // If Macd Crossed over the Signal line
        if (technicalAnalysis.macd.macdCrossoverSignal) {
            if (technicalAnalysis.macd.macdGTSignal) {
                // And macd is greater than signal
                return CONSTANTS.BUY;
            } else {
                // And macd is less than signal
                return CONSTANTS.SELL;
            }
        }
        return CONSTANTS.NA;
    }

}
