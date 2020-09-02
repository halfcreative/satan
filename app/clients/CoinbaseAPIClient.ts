import {
    AuthenticatedClient,
    ProductTicker,
    OrderParams,
} from "coinbase-pro";


const API_KEY: string = process.env.API_KEY;
const API_SECRET: string = process.env.API_SECRET;
const PASS: string = process.env.PASS_PHRASE;
const API_URI: string = process.env.API_URI;

export class CoinbaseAPIClient {

    private coinbaseProClient: AuthenticatedClient;

    constructor() {
        this.coinbaseProClient = new AuthenticatedClient(
            API_KEY,
            API_SECRET,
            PASS,
            API_URI
        );
    }

    public getTicker(currency: string): Promise<ProductTicker> {
        return this.coinbaseProClient.getProductTicker(currency);
    }

    public getHistory() {
        return this.coinbaseProClient.getProductHistoricRates
    }
    /**
    * gets the historical rate of a specified currency across a specified time period.
    *
    * @param {number} range days to go back
    * @param {string} currency the currency to get rates for. (BTC-USD,ETH-USD,etc.)
    * @param {number} base iThe base indicates which value to get.
    * 1 - High,
    * 2 - Low,
    * 3 - Open,
    * 4 - Close,
    * @returns PROMISE Array of prices from most recent to least recent.
    */
    public getHistoricRatesByDay(
        range: number,
        currency: string,
    ): Promise<Array<Array<number>>> {
        let currentDate = new Date();
        let periodDate = new Date(
            new Date().setDate(currentDate.getDate() - range)
        );
        return this.coinbaseProClient
            .getProductHistoricRates(currency, {
                start: periodDate.toISOString(),
                end: currentDate.toISOString(),
                granularity: 86400
            })
    }
    /**
    * sends a order request to the Coinbase API
    *
    * @param {OrderParams} order an OrderParams object returned from the Evaluator inside the evaluation;
    */
    public executeOrder(order: OrderParams) {
        return this.coinbaseProClient.placeOrder(order);
    }

}