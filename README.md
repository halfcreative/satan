# SATAN (Sam's Automatic Trading Assistant Network)

Satan is a securities trading algorithm written in typescript.

## Goals/Intentions

At it's core Satan is intended to be like any other easily modifiable trading bot.
Beyond the basic functionality of a trading bot, I also intend for satan to consult it's user in times of uncertainty. To perform it's normal operations, satan should be tracking and analyzing a variety of indicators and signals. When satan encounters moments where signals are conflicting, leading to uncertainty, satan should notify and request the user's decision on the matter, providing the user with all the relavent information leading to the uncertainty. After a decision is made by the user, the choice to buy/sell/do nothing should be recorded, as well as the results of the trade decision (did the trade result in a profit or loss or missed profit or loss). When the bot encounters uncertainty of similar nature in the future, the user should be provided will all relavent past decisions made, enabling the user to make a more informed decision. If the user decision and its result reach a certain level of consistency the bot could then also adjust it's own reliability metrics for indicators, enabling the bot to make better decisions.

## Notes on current state :

Satan only supports the trading of cryptocurrency through Coinbase PRO. - I intend to add support for more platforms in the future.
Satan only supports notifications through the use of AWS SNS while operating through AWS Lambda. - I intend to also add basic email support in the future.

# Installation (poor instructions - will improve in the future)
At the present moment, SATAN has no automated deployment procedures.

Satan can either be run locally or as an AWS Lambda function.

In order to utilize satan, you will need an account with a supported exchange (currently only Coinbase Pro) and a supported database (currently only mongodb).

NOTE: Satan is capable of running well within the restrictions of the "free" tier of AWS Lambda, and MongoDB. The only "cost" of running the bot should be in the trading fees collected on each order by Coinbase.

You can create an account with the services here:
[Amazon AWS](https://aws.amazon.com/)
[MongoDB](https://www.mongodb.com/)
[Coinbase Pro](https://pro.coinbase.com/)

# Install Locally for development and testing

Download/Clone this repository.
Proceed to change directory to this repo, then install the project.

```bash
git clone https://github.com/halfcreative/satan.git
cd satan
npm install
```

You will need to create a .env file in the root of the repository, containing the following [environment variables](#Evnironment-Variables):




Before running, build the project (compile down the typescript to js) using:

```bash
npm run build
```

then run the project using:
```bash
npm run handler
```

# Configure to run consistently on AWS

Download/Clone this repository.
Proceed to change directory to this repo, then install and build the project.

```bash
git clone https://github.com/halfcreative/satan.git
cd satan
npm install
npm run build
npm run package
```

Take the resulting satan.zip file, and upload it to AWS Lambda.

In the aws console configure the [environment variables](#Evnironment-Variables) 

configure a cloudwatch even on a chron timer to call the lambda on a specified interval and you've got a running instance of Satan.


# Environment Variables

```
API_KEY=CoinbaseProAPIKey
API_SECRET=CoinbaseProAPIKeySecret
PASS_PHRASE=CoinbaseProAPIPassPhrase
DB_NAME=MongoDBDatabaseName
MONGODB_URI=MongoDBURI
TOPIC_ARN=AWSSNSTopicARN
```

To be able to buy and sell cryptocurrency, satan requries access to the coinbase pro private api. To enable this access, satan requires an API_KEY, API_SECRET and PASS_PHRASE. To get the API_KEY, API_SECRET and PASS_PHRASE, you will need to generate an api key using your coinbase pro account.
[Coinbase Pro API Key Instructions](https://help.coinbase.com/en/pro/other-topics/api/how-do-i-create-an-api-key-for-coinbase-pro)

Satan requires mongodb as it's database, and therefore requires the env variable MONGODB_URI. This is a connection string URI, either from your local mongodb instance, or from a managed MongoDB Atlas cluster following the instructions here:
[MongoDB Connect to cluster tutorial](https://docs.atlas.mongodb.com/tutorial/connect-to-your-cluster)
DB_NAME should be the same database name provided in the URI.

To Utilize AWS SNS, you will need to provide TOPIC_ARN, and also configure the AWS_Lambda with the permissions to publish messages to the topic.

## Contributing
Suggestions and Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
