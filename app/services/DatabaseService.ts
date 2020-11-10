import { MongoDBClient } from '../clients/MongoDBClient';
import { Db } from 'mongodb';
import { Evaluation } from '../models/EvaluationModel';

export class DBService {

    private dbClient: MongoDBClient;

    constructor() {
        this.dbClient = new MongoDBClient();
    }

    public storeEvaluation(collection: string, evaluation: Evaluation): Promise<Evaluation> {
        return this.dbClient.connectToDatabase().then((db: Db) => {
            return this.dbClient.storeEvaluation(db, collection, evaluation).then(storedEval => { return storedEval });
        })

    }

    public getMostRecentEvaluation(collection: string): Promise<Evaluation> {
        return this.dbClient.connectToDatabase().then((db: Db) => {
            console.log("getting last eval");
            return this.dbClient.getLastEvaluation(db, collection);
        })
    }

}