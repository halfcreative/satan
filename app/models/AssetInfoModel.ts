import { ProductTicker } from "coinbase-pro";

export class AssetInformationModel {
    public ticker: ProductTicker;
    public history: Array<Array<number>>;

    constructor(ticker: ProductTicker, history: Array<Array<number>>) {
        this.ticker = ticker;
        this.history = history;
    }
}