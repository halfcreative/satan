import { NotificationService } from "../services/NotificationService";
import { Evaluation } from "../models/EvaluationModel";
import { AssetService } from "../services/AssetService";
import { DBService } from "../services/DatabaseService";

export class Executor {

    private assetService: AssetService;
    private dbService: DBService;
    private notificationService: NotificationService;

    constructor(assetService: AssetService, dbService: DBService, notificationServ: NotificationService) {
        this.assetService = assetService;
        this.dbService = dbService;
        this.notificationService = notificationServ;
    }

    public async executeOrderFromEvaluation(evaluation: Evaluation): Promise<Evaluation> {
        if (evaluation.trade) {
            console.info("Trade Request Confirmed");
            console.log(`${evaluation.trade.orderParams} orders to place`);
            return this.assetService.executeMultipleOrders(evaluation.trade.orderParams).then(async (result) => {
                evaluation.trade.orderReciepts = result;
                await this.notificationService.sendOrderNotification(evaluation.price, evaluation.trade);
                return evaluation;
            }).catch(err => {
                return err;
            });
        } else {
            return evaluation;
        }
    }
}
