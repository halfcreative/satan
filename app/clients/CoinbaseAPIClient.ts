import {
    AuthenticatedClient,
    ProductTicker,
    OrderParams,
    Account
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

}