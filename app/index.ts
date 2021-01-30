import 'dotenv/config'
import { FlowHandler } from "./workers/FlowHandler";

let flowHandler: FlowHandler | null = null;

/**
 * Starting point of the application. Initiate the flow handler, and start the code flow.
 * @param event Event object that activated the lambda function.
 * @param context Context object giving information about the lambda environment.
 * @param callback Callback object providing the callback function to exit the lambda.
 */
const handler = async event => {
    if (!flowHandler) {
        flowHandler = new FlowHandler();
    }
    const result = await flowHandler.initCodeFlow(event);
    console.log(result);
    process.exit();
};

export { handler };
