import { OrderResult } from "coinbase-pro";
import { Evaluation } from "../models/EvaluationModel";
import { AssetService } from "../services/AssetService";
import { DBService } from "../services/DatabaseService";

export class Executor {

    private assetService: AssetService;
    private dbService: DBService;

    constructor(assetService: AssetService, dbService: DBService) {
        this.assetService = assetService;
        this.dbService = dbService;
    }

    public executeOrderFromEvaluation(evaluation: Evaluation) {
        if (evaluation.orders) {
            console.info("Order Request Confirmed");
            const orders = evaluation.orders.length;
            console.log(orders + " orders to place");
            return this.assetService.executeMultipleOrders(evaluation.orders);
        } else {
            return null;
        }
    }
}