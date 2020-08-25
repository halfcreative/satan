import { Handler, Context, Callback } from "aws-lambda";
import { FlowHandler } from "./workers/FlowHandler";

let flowHandler: FlowHandler | null = null;

const handler: Handler = (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!flowHandler) {
        flowHandler = new FlowHandler();
    }

    flowHandler.initCodeFlow(event, callback);
};

export { handler };