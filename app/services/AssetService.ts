import { CoinbaseAPIClient } from "../clients/CoinbaseAPIClient";
import { OrderParams } from "coinbase-pro";

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

    public async getTicker() {
        return this.coinbase.getTicker();
    }

    public executeOrder(order: OrderParams) {
        return this.coinbase.executeOrder(order);
    }

}