import { Evaluation } from "../models/EvaluationModel";
import { Db, MongoClient } from "mongodb";

const MONGODB_URI: string = process.env.MONGODB_URI;
const DB_NAME: string = process.env.DB_NAME;

export class MongoDBClient {
    private cachedDb: Db | null = null;

    public connectToDatabase(): Promise<Db> {
        if (this.cachedDb) {
            console.info("***Using cached DB***");
            return Promise.resolve(this.cachedDb);
        } else {
            console.info("***Creating new DB connection instance***");
            return MongoClient.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
                .then(Client => {
                    this.cachedDb = Client.db(DB_NAME);
                    console.info(
                        "***Successfully established DB Connection***"
                    );
                    return this.cachedDb;
                })
                .catch(e => {
                    console.error(`Error: connectToDatabase - MongoClient.connect(${MONGODB_URI},${{
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    }}) encountered an exception`);
                    console.error(e);
                    return null;
                });
        }
    }

    public storeEvaluation(
        db: Db,
        collection: string,
        data: any
    ): Promise<Evaluation> {
        return db
            .collection(collection)
            .insertOne(data)
            .then(() => {
                console.info("***Evaluation Stored Successfully***");
                return data;
            })
            .catch(e => {
                console.error(`Error: storeEvaluation - collection(${collection}).insertOne(${data}) encountered an exception`);
                console.error(e);
                return null;
            });
    }

    /**
     * retrieves the previous evaluation from the database.
     *
     * @param {Db} db
     * @returns {Promise<Array<any>>}
     * @memberof DBRepository
     */
    public getLastEvaluation(db: Db, collection: string): Promise<Evaluation> {
        // This function was changed to this promise format, because returning the pdirect promise was returning undefined.
        return new Promise(function (resolve, reject) {
            db.collection(collection).find().sort({ $natural: -1 }).toArray(function (err, docs) {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                return resolve(docs[0]);
            });
        });
    }

}
