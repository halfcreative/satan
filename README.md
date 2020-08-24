# SATAN (Semi-Automatic Trading Algorithm Network)

Satan is intended to be a serverless trading algorithm written in typescript.

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