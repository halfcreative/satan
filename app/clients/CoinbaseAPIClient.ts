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

    public getTicker(): Promise<ProductTicker> {
        return this.coinbaseProClient.getProductTicker("BTC-USD");
    }

    /**
    * sends a order request to the Coinbase API
    *
    * @param {OrderParams} order an OrderParams object returned from the Evaluator inside the evaluation;
    * @memberof APIRepository
    */
    public executeOrder(order: OrderParams) {
        return this.coinbaseProClient.placeOrder(order);
    }
}