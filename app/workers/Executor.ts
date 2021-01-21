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

    public async executeOrderFromEvaluation(evaluation: Evaluation) {
        if (evaluation.orders.length > 0) {
            console.info("Order Request Confirmed");
            console.log(`${evaluation.orders.length} orders to place`);
            return this.assetService.executeMultipleOrders(evaluation.orders).then(async (result) => {
                await this.notificationService.sendOrderNotification(evaluation.price, evaluation.orders);
                return result
            }).catch(err => {
                return err
            });
        } else {
            await this.notificationService.sendTestNotification();
            return null;
        }
    }
}