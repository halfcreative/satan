import * as AWS from 'aws-sdk';
const TOPIC_ARN: string = process.env.API_KEY;
const SNS = new AWS.SNS();

export class SNSClient {

  public async publishMessage(message: string) {
    const params = {
      Message: message, /* required */
      TopicArn: TOPIC_ARN
    };

    return SNS.publish(params).promise();
  }
}