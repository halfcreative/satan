import { CoinbaseAPIClient } from "../clients/CoinbaseAPIClient";
import { OrderParams, OrderResult } from "coinbase-pro";

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

    public async getHistory(currency: string, range) {
        return this.coinbase.getHistoricRatesByDay(range, currency);
    }

    /**
         * Slims down historic data provided by coinbase into a single set of prices.
         * The base indicates which value to get.
         * 1 - High, (trim down the history to just history of Highs)
         * 2 - Low, (trim down the history to just history of Lows)
         * 3 - Open, (trim down the history to just history of Open)
         * 4 - Close, (trim down the history to just history of Close)
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


}