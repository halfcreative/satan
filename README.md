# SATAN (Semi-Automatic Trading Assistant Network)

Satan is intended to be a serverless trading algorithm written in typescript.

The goal is for satan to automatically retrieve and analyze the price of a security and make decisions whether or not to buy or sell based on defined conditions.
Satan should be analyzing a variety of conditions when making the decision to buy or sell and will inevitably encounter times when certain the algorithm encounters conflicting signals.
In those cases, The bot should present the senario to the user, requireing human interaction to ultimately decide whether to buy or sell. 
These decisions should be recorded, and data should be recorded on the state of the security following the decision, and present this additional info when encountering similar conflicting signals.


## Installation (INCOMPLETE INSTRUCTIONS WILL UPDATE)
If you look at this project and want to have your own copy running, then you can "install" it by :

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
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
