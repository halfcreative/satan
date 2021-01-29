import { Handler, Context, Callback } from "aws-lambda";
import { FlowHandler } from "./workers/FlowHandler";

let flowHandler: FlowHandler | null = null;

/**
 * Starting point of the application. Initiate the flow handler, and start the code flow.
 * @param event Event object that activated the lambda function.
 * @param context Context object giving information about the lambda environment.
 * @param callback Callback object providing the callback function to exit the lambda.
 */
const handler: Handler = (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!flowHandler) {
        flowHandler = new FlowHandler();
    }

    flowHandler.initCodeFlow(event, callback);
};

export { handler };
