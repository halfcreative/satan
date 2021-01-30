import { Evaluation, Trade } from "../models/EvaluationModel";
import { DBService } from "../services/DatabaseService";

export class Auditor {

    private dbService: DBService;

    constructor(databaseService: DBService) {
        this.dbService = databaseService;
    }

    public async runAudit(evaluation: Evaluation): Promise<Evaluation> {
        if (evaluation.trade) {
            await this.storeTradeRecord(evaluation.trade);
        }
        return this.storeEvaluation(evaluation);
    }

    private storeEvaluation(evaluation: Evaluation): Promise<Evaluation> {
        return this.dbService.storeEvaluation(evaluation);
    }

    private storeTradeRecord(trade: Trade) {
        return this.dbService.storeTrade(trade);
    }

    private reflectOnPastTrades() {

    }
}