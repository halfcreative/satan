import { CoinbaseAPIClient } from "../clients/CoinbaseAPIClient";
import { Account, OrderInfo, OrderParams, OrderResult } from "coinbase-pro";
import { BUY } from "constants/constants";

/**
 * Service for getting asset information.
 * Currently only supports Cryptocurrencies from Coinbase
 * Goal is to enable stock trading, as well as cryptocurrency alternatives to Coinbase.
 */
export class AssetService {

    private coinbase: CoinbaseAPIClient;

    constructor() {
        this.coinbase = new CoinbaseAPIClient();
    }

    public async getTicker(currency: string) {
        return this.coinbase.getTicker(currency);
    }

    public async getHistory(currency: string, range: number) {
        return this.coinbase.getHistoricRatesByDay(range, currency);
    }

    /**
         * Slims down historic data provided by coinbase into a single set of prices.
         * The base indicates which value to get.
         * 1 - High, (trim down the history to just history of Highs)
         * 2 - Low, (trim down the history to just history of Lows)
         * 3 - Open, (trim down the history to just history of Open)
         * 4 - Close, (trim down the history to just history of Close)
         * 5 - Volume, (trim down the history to just history of Volume)
         *
         * @param {Array<Array<number>>} history
         * @param {number} base
         * @returns {Array<number>} history -slimmed
         */
    public singleSetHistory(
        history: Array<Array<number>>,
        base: number
    ): Array<number> {
        let slimmedArray: Array<number> = [];
        for (let i = 0; i < history.length; i++) {
            slimmedArray.push(history[i][base]);
        }
        return slimmedArray;
    }

    public executeOrder(order: OrderParams): Promise<OrderResult> {
        return this.coinbase.executeOrder(order);
    }

    public executeMultipleOrders(orders: Array<OrderParams>): Promise<Array<OrderResult>> {
        const promises: Array<Promise<OrderResult>> = [];
        for (const order of orders) {
            promises.push(this.executeOrder(order));
        }
        return Promise.all(promises);
    }

    public executeTrade(orders: Array<OrderParams>): Promise<Array<OrderResult>> {
        const orderResults: Array<OrderResult> = [];
        if (orders[0].side == BUY) {
            // Buy contains a buy order and a stop loss. get the size for the stop loss from the result of the buy order
            return this.executeOrder(orders[0]).then(result => {
                orders[1].size = result.size;
                orderResults.push(result);
                return this.executeOrder(orders[1])
            }).then(resultSellOrder => {
                orderResults.push(resultSellOrder);
                return orderResults;
            });
        } else {
            // Right now, sell side only contains a single order
            return this.executeOrder(orders[0]).then(result => {
                orderResults.push(result);
                return orderResults;
            });
        }
    }

    public getAccounts(): Promise<Array<Account>> {
        return this.coinbase.getAccounts();
    }

    public getAllOrders(currency: string): Promise<Array<OrderInfo>> {
        return this.coinbase.getOrders(currency, 'all');
    }

    public getCompleteOrders(currency: string): Promise<Array<OrderInfo>> {
        return this.coinbase.getOrders(currency, 'done');
    }

    public getOpenOrders(currency: string): Promise<Array<OrderInfo>> {
        return this.coinbase.getOrders(currency);
    }

    public getOrderById(id: string): Promise<OrderInfo> {
        return this.coinbase.getOrder(id);
    }


}
