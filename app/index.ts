import { Handler, Context, Callback } from "aws-lambda";
import { AssetService } from "./services/AssetService";
import { EventHandler } from "./workers/EventHandler";

let eventHandler: EventHandler | null = null;

const handler: Handler = (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!eventHandler) {
        eventHandler = new EventHandler();
    }

    eventHandler.initCodeFlow(event, callback);
};

export { handler };