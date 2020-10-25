# SATAN (Semi-Automatic Trading Assistant Network)

Satan is a securities trading algorithm written in typescript. Satan is currently intended to be run on a serverless platform such as Lambda by AWS.

The goal is for satan to automatically retrieve and analyze the price of a security and make decisions whether or not to buy or sell based on defined conditions. (Like a trading bot should.)
Beyond this base functionality, the goal is for satan to require human interaction on cases that the bot encounters "uncertainty" in making a trading decision. "Uncertainty" could arise from situations where the bot sees conflicting buy or sell signals from different analysis methods. 
These decisions made by the user should be recorded, and in the future when a similar uncertain moment arises, satan should present the user with their previous decision as well as the results of the decision in the time following.

In it's current state, satan only supports the trading of Bitcoin through Coinbase PRO. On top of this, Satan is presently only designed to be hosted on AWS lambda with MongoDB as the database. There are plans to add support for other cryptocurrencies, trading platforms, backend databases, and hosting methods.

## Installation (INCOMPLETE INSTRUCTIONS - WILL UPDATE)
At the present moment, SATAN has no automated deployment procedures. Also, satan is currently only designed around usage with AWS Lambda, MongoDB, and Coinbase. Therefore, to run an instance of SATAN, one must have an account with each of these services. 
Satan is able to run well within the "free" tier of Amazon AWS and MongoDB, and Coinbase will only take money as a percentage of transactions, so you can easily develop and test for free.

You can create an account with the services here:
[Amazon AWS](https://aws.amazon.com/)
[MongoDB](https://www.mongodb.com/)
[Coinbase Pro](https://pro.coinbase.com/)

After you have created an account with the services above:

Download this repository

```bash
cd satan
npm install
npm run build
npm run package
```

then take the resulting satan.zip file, and upload it to AWS Lambda.
you will need to configure some environment variables to connect to the asset service (coinbasePro is the only one implemented right now) and database service (only mongoDb at the moment.)

## Contributing
Suggestions and Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
