import { MongoDBClient } from '../clients/MongoDBClient';
import { Db } from 'mongodb';
import { Evaluation } from 'models/EvaluationModel';

export class DBService {

    private dbClient: MongoDBClient;

    constructor() {
        this.dbClient = new MongoDBClient();
    }

    public storeEvaluation(evaluation: any, collection: string): Promise<any> {
        return this.dbClient.connectToDatabase().then((db: Db) => {
            return this.dbClient.storeEvaluation(db, collection, evaluation);
        })

    }

    public getMostRecentEvaluation(collection: string): Promise<Array<Evaluation>> {
        return this.dbClient.connectToDatabase().then((db: Db) => {
            return this.dbClient.getLastEvaluation(db, collection);
        })
    }

}