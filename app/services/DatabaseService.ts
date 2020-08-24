import { MongoDBClient } from '../clients/MongoDBClient';
import { Db } from 'mongodb';

export class DBService {
    private dbClient: MongoDBClient;

    public storeEvaluation(evaluation: any, collection: string): Promise<any> {
        if (!this.dbClient) {
            this.dbClient = new MongoDBClient();
        }
        return this.dbClient.connectToDatabase().then((db: Db) => {
            return this.dbClient.storeEvaluation(db, collection, evaluation);
        })

    }

    public getMostRecentEvaluations(collection: string): Promise<any[]> {
        if (!this.dbClient) {
            this.dbClient = new MongoDBClient();
        }
        return this.dbClient.connectToDatabase().then((db: Db) => {
            return this.dbClient.getLastEvaluation(db, collection);
        })
    }

}