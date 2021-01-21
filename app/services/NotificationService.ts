import { SNSClient } from "../clients/SNSClient";
import { OrderParams } from "coinbase-pro";

export class NotificationService {
    private snsClient: SNSClient;

    public sendTestNotification() {
        if (!this.snsClient) {
            this.snsClient = new SNSClient();
        }
        let message = `This is a test message`;
        return this.snsClient.publishMessage(message).then(res => { return true }).catch(err => { console.error(err, err.stack); return false });
    }

    public sendOrderNotification(price: number, orders: Array<OrderParams>) {


        if (!this.snsClient) {
            this.snsClient = new SNSClient();
        }
        let message = `Placing the following order${orders.length > 1 ? 's' : ''}:\n`;
        for (let order of orders) {
            message += `A ${order.type} ${order.side} order for ${order.size} of ${order.product_id} at ${price} totalling ${parseInt(order.size) * price}\n`;
        }
        return this.snsClient.publishMessage(message).then(res => { return true }).catch(err => { console.error(err, err.stack); return false });
    }

}