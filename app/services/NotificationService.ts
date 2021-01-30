import { SNSClient } from "../clients/SNSClient";
import { Trade } from "models/EvaluationModel";

export class NotificationService {

    private snsClient: SNSClient;

    public sendTestNotification() {
        if (!this.snsClient) {
            this.snsClient = new SNSClient();
        }
        let message = `This is a test message`;
        return this.snsClient.publishMessage(message).then(res => { return true }).catch(err => { console.error(err, err.stack); return false });
    }

    public sendOrderNotification(price: number, trade: Trade) {
        console.info("Sending Order Info")
        if (!this.snsClient) {
            this.snsClient = new SNSClient();
        }
        let message = `Placing the following order${trade.orderParams.length > 1 ? 's' : ''}:\n`;
        for (let order of trade.orderParams) {
            message += `A ${order.type} ${order.side} order for ${order.size} of ${order.product_id} at ${price} totalling ${parseInt(order.size) * price}\n`;
        }
        return this.snsClient.publishMessage(message).then(res => { return true }).catch(err => { console.error(err, err.stack); return false });
    }

}
