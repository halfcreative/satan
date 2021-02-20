import { OrderParams, Account, OrderResult } from "coinbase-pro";

export class Evaluation {

    public date: Date;
    public currency: string;
    public portfolioState: PortfolioState;
    public price: number;
    public technicalAnalysis: TechnicalAnalysis;
    public hindsight: Hindsight;
    public placeOrder: boolean;
    public trade: Trade | null;

    constructor() {
        this.date = new Date();
    }

}

export class Hindsight {

    public oneDay: number;
    public threeDay: number;
    public fiveDay: number;
    public tenDay: number;
    public month: number;

}

export class TechnicalAnalysis {

    public sma20: number;
    public sma50: number;
    public ema12: number;
    public ema26: number;
    public macd: MACD;
    public rsi14: number;
    public vi: VortexIndicatorLines;
    public averageRateOfChange: number;
    public ichimokuCloud: IchimokuCloud;
    public obv: number;
    public mfi: number;

}

export class MACD {

    public macd: number;
    public macdSignal: number;
    public prevMACD: number;
    public prevMACDSignal: number;
    public macdGTSignal: boolean;
    public convergingMacdSignal: boolean;
    public macdCrossoverSignal: boolean;

    constructor(macd: number, signal: number, prevMACDOBJ?: MACD) {
        this.macd = macd;
        this.macdSignal = signal;
        this.macdGTSignal = macd > signal;
        if (prevMACDOBJ) {
            this.prevMACD = prevMACDOBJ.macd;
            this.prevMACDSignal = prevMACDOBJ.macdSignal;
            if (
                Math.abs(macd - signal) <
                Math.abs(prevMACDOBJ.macd - prevMACDOBJ.macdSignal)
            ) {
                //the distance between the macD and signal is shrinking
                this.convergingMacdSignal = true;
            } else {
                this.convergingMacdSignal = false;
            }
            this.macdCrossoverSignal =
                prevMACDOBJ.macdGTSignal != this.macdGTSignal
                    ? true
                    : false;
        }
    }

}

export class VortexIndicatorLines {

    public uptrend: Array<number> = [];
    public downtrend: Array<number> = [];

}

export class IchimokuCloud {
    public tenkaSen: number;
    public kijunSen: number;
    public senkouSpanA: number;
    public senkouSpanB: number;
    public chikouSpan: number;
}

export class PortfolioState {

    public totalValue: number;
    public accounts: Array<Account>;

    constructor(value: number, acnts: Array<Account>) {
        this.totalValue = value;
        this.accounts = acnts;
    }

}

export class Trade {
    public orderParams: Array<OrderParams>;
    public orderReciepts: Array<OrderResult>;
    public result: number = 0; // 0 for no result, 1 for win , 2 for loss

    public getOrderIds() {
        const ids: Array<string> = [];
        if (this.orderReciepts) {
            for (const order of this.orderReciepts) {
                ids.push(order.id);
            }
        }
        return ids;
    }
}
