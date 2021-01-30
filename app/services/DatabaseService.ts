import { MongoDBClient } from '../clients/MongoDBClient';
import { Db } from 'mongodb';
import { Evaluation, Trade } from '../models/EvaluationModel';

export class DBService {

    private dbClient: MongoDBClient;

    constructor() {
        this.dbClient = new MongoDBClient();
    }

    public storeEvaluation(evaluation: Evaluation): Promise<Evaluation> {
        console.info(`Storing Evaluation`);
        return this.dbClient.connectToDatabase().then((db: Db) => {
            return this.dbClient.storeEvaluation(db, evaluation).then(storedEval => { return storedEval });
        })

    }

    public getMostRecentEvaluation(collection: string): Promise<Evaluation> {
        console.info(`Retrieving Most Recent Evaluation`);
        return this.dbClient.connectToDatabase().then((db: Db) => {
            return this.dbClient.getLastEvaluation(db);
        })
    }

    public storeTrade(trade: Trade) {
        console.info(`Storing Evaluation`);
        return this.dbClient.connectToDatabase().then((db: Db) => {
            return this.dbClient.storeTrade(db, trade).then(storedTrade => { return storedTrade });
        })
    }

}
