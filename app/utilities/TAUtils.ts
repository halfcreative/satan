import { IchimokuCloud, VortexIndicatorLines } from "../models/EvaluationModel";

/**
 * Get the simple moving average from a list of numbers.
 * 
 * For more information : 
 * https://school.stockcharts.com/doku.php?id=technical_indicators:moving_averages
 * @param {Array<number>} values Array of numbers ordered from most recent to least recent.
 * @param {number} range The range to calculate the simple moving average 
 * @returns one SMA value for the most recent data point provided.
 */
export function sma(values: Array<number>, range: number): number {
    const array = values.slice(0, range);
    const sum = array.reduce(function (a, b) {
        return a + b;
    }, 0);
    return (sum / range);
}

/**
 * Gets the exponential moving average of a set of values
 *
 * For more information :
 * https://school.stockcharts.com/doku.php?id=technical_indicators:moving_averages
 * @param {Array<number>} prices array of prices from most recent to least recent
 * @param {number} range the window of values to consider for calculation.
 * @returns {Array<number>} array of exponential moving averages
 */
export function ema(values: Array<number>, range: number): Array<number> {
    // prices come in with the most recent price in position 0
    // need to reverse array for calculation then re-reverse resulting array
    const reversedValues = values.slice(0).reverse();
    const k = 2 / (range + 1);
    const emaArray = [sma(reversedValues, range)];
    for (let i = 1; i < reversedValues.length; i++) {
        emaArray.push(reversedValues[i] * k + emaArray[i - 1] * (1 - k));
    }
    emaArray.reverse();
    return emaArray;
}

/**
 * Calculates the Relative Strength Index given a history of prices.
 * 
 * For more information :
 * https://school.stockcharts.com/doku.php?id=technical_indicators:relative_strength_index_rsi
 * @param values array of prices from most recent to least recent
 * @param range the window of values to consider for calculation.
 */
export function rsi(values: Array<number>, range: number): number {
    const averageGain = averageChange(values, range, true);
    const averageLoss = averageChange(values, range, false);
    if (averageLoss === 0) {
        return 100;
    }
    const RSI: number = 100 - 100 / (1 + averageGain / averageLoss);
    return RSI;
}

/**
 * Calculates the Moving Average Convergence/Divergence line for the Moving Average Convergence/Divergence oscillator
 * 
 * For more information :
 * https://school.stockcharts.com/doku.php?id=technical_indicators:moving_average_convergence_divergence_macd
 * @param values array of prices from most recent to least recent
 * @param range the window of values to consider for calculation
 */
export function macd(values: Array<number>, range): Array<number> {
    let macds: Array<number> = [];
    const ema12: Array<number> = ema(values, 12);
    const ema26: Array<number> = ema(values, 26);
    for (let i = 0; i < range; i++) {
        macds.push(ema12[i] - ema26[i]);
    }
    return macds;
}

/**
 * Calculates the signal line for the Moving Average Convergence/Divergence oscillator
 * 
 * For more information :
 * https://school.stockcharts.com/doku.php?id=technical_indicators:moving_average_convergence_divergence_macd
 * @param macdValues array of macd values from most recent to least recent.
 */
export function macdSignal(macdValues: Array<number>): Array<number> {
    return ema(macdValues, 9);
}

/**
 * helper method for RSI. calculates the average gain or average loss over a period.
 * 
 * @param values array of prices from most recent to least recent.
 * @param range the window of values to consider for calculation.
 * @param gainsOrLosses true or false. true returns the average gain, and false returns the average loss.
 */
export function averageChange(
    values: Array<number>,
    range: number,
    gainsOrLosses: boolean
): number {
    const sum = (accumulator, currentValue) => accumulator + currentValue;
    const changes: Array<number> = [];
    for (let i = 0; i < range; i++) {
        const change: number = values[i] - values[i + 1];
        if (gainsOrLosses) {
            if (change > 0) {
                changes.push(change);
            }
        } else {
            if (change < 0) {
                changes.push(Math.abs(change));
            }
        }
    }
    const len = changes.length;
    return changes.reduce(sum) / len;
}

/**
 * Similar to averageChange, averageROC (average rate of change) calucates the average percent change in either the positive or negative direction.
 * 
 * @param values array of prices from most recent to least recent.
 * @param range the window of values to consider for calculation.
 * @param gainsOrLosses true or false. true returns the average gain, and false returns the average loss 
 */
export function averageROC(
    values: Array<number>,
    range: number,
    gainsOrLosses: boolean
): number {
    const sum = (accumulator, currentValue) => accumulator + currentValue;
    const percentDifArray: Array<number> = [];
    for (let i = 0; i < range; i++) {
        const change: number = values[i] - values[i + 1];
        if (gainsOrLosses) {
            if (change > 0) {
                percentDifArray.push(change / values[i + 1]);
            }
        } else {
            if (change < 0) {
                percentDifArray.push(Math.abs(change) / values[i + 1]);
            }
        }
    }
    const len = percentDifArray.length;
    return percentDifArray.reduce(sum) / len;
}

/**
 * Calculates the Vortex Indicator (vi) which is composed of an uptrend and downtrend line.
 * 
 * For more information :
 * https://school.stockcharts.com/doku.php?id=technical_indicators:vortex_indicator
 * @param high array of the daily highs from most recent to least recent.
 * @param low array of daily lows from most recent to least recent.
 * @param close array of the daily closing price from most recent to least recent.
 * @param period the window to calculate the lines within. (between 14 and 30 days is common)
 */
export function vi(high: Array<number>, low: Array<number>, close: Array<number>, period: number): VortexIndicatorLines {
    //Uptrend Movement
    const pv: Array<number> = [];
    //Downtrend Movement
    const nv: Array<number> = [];
    //Calculate Uptrend and Downtrend
    const window = Math.min(high.length, low.length, close.length) - 1;
    for (let i = 0; i < window; i++) {
        pv.push(Math.abs(high[i] - low[i + 1]));
        nv.push(Math.abs(low[i] - high[i + 1]));
    }
    //Get true range
    const tr = trueRange(high, low, close);
    //Sum the tr, nv and pv over the requested period
    const sum = (accumulator, currentValue) => accumulator + currentValue;
    const sumPV: Array<number> = [];
    const sumNV: Array<number> = [];
    const sumTR: Array<number> = [];
    for (let i = 0; i < (1 + period); i++) {
        sumPV.push(pv.slice(i, i + period).reduce(sum));
        sumNV.push(nv.slice(i, i + period).reduce(sum));
        sumTR.push(tr.slice(i, i + period).reduce(sum));
    }
    //Calculate the uptrend and downtrend lines.
    const vortexLines = new VortexIndicatorLines();

    for (let i = 0; i < period; i++) {
        vortexLines.uptrend.push(sumPV[i] / sumTR[i]);
        vortexLines.downtrend.push(sumNV[i] / sumTR[i]);
    }
    return vortexLines;
}

/**
 * Function to calculate the True Range of a set of prices.
 * True Range is defined as the largest of the following:
 * - The distance from today's high to today's low.
 * - The distance from yesterday's close to today's high.
 * - The distance from yesterday's close to today's low.
 * 
 * @param high array of the daily highs from most recent to least recent.
 * @param low array of daily lows from most recent to least recent.
 * @param close array of the daily closing price from most recent to least recent.
 */
export function trueRange(high: Array<number>, low: Array<number>, close: Array<number>) {
    const trueRanges: Array<number> = [];
    let range = Math.min(high.length, low.length, close.length) - 1;
    for (let i = 0; i < range; i++) {
        trueRanges.push(Math.max(high[i] - low[i], Math.abs(high[i] - close[i + 1]), Math.abs(low[i] - close[i + 1])));
    }
    return trueRanges;
}

/**
 * Calculates the Ichimoku Kinko Hyo Indicator
 * 
 * For more information :
 * https://school.stockcharts.com/doku.php?id=technical_indicators:ichimoku_cloud
 * @param high array of the daily highs from most recent to least recent.
 * @param low array of daily lows from most recent to least recent.
 * @param close array of the daily closing price from most recent to least recent.
 */
export function ihk(highs: Array<number>, lows: Array<number>, close: Array<number>) {
    const cloud: IchimokuCloud = new IchimokuCloud();
    //Tenkan-sen (Conversion Line): (x-period high + x-period low)/2)) (x is typically 9)
    cloud.tenkaSen = (Math.max(...highs.slice(0, 9)) + Math.min(...lows.slice(0, 9))) / 2;
    //Kijun-sen (Base Line): (y-period high + y-period low)/2)) (y is typically 26)
    cloud.kijunSen = (Math.max(...highs.slice(0, 26)) + Math.min(...lows.slice(0, 26))) / 2;
    //Senkou Span A (Leading Span A): (Conversion Line + Base Line)/2))
    cloud.senkouSpanA = (cloud.tenkaSen + cloud.kijunSen) / 2;
    //Senkou Span B (Leading Span B): (52-period high + 52-period low)/2))
    cloud.senkouSpanB = (Math.max(...highs.slice(0, 52)) + Math.min(...lows.slice(0, 52))) / 2;
    //Chikou Span (Lagging Span): Close plotted 26 days in the past
    cloud.chikouSpan = close[26];
    return cloud;
}

/**
 * Calculates the On-Balance Volume of an asset.
 * 
 * For more information :
 * https://school.stockcharts.com/doku.php?id=technical_indicators:on_balance_volume_obv
 * @param close array of the daily closing price from most recent to least recent.
 * @param volumes array of daily volume from most recent to least recent.
 * @param period the number of days to calculate obv for
 */
export function obv(close: Array<number>, volumes: Array<number>, period: number): number {
    let total = 0;
    for (let i = 0; i < period; i++) {
        if (i == 0) {
            total = volumes[0];
        } else {
            if (close[i] > close[i - 1]) {
                total += volumes[i];
            } else if (close[i] < close[i - 1]) {
                total -= volumes[i]
            }
        }
    }
    return total;
}

/**
 * Calculates the Money Flow Index (money flow index) of an asset.
 * 
 * For more information :
 * https://school.stockcharts.com/doku.php?id=technical_indicators:money_flow_index_mfi
 * @param highs array of the daily highs from most recent to least recent.
 * @param lows array of daily lows from most recent to least recent.
 * @param close array of the daily closing price from most recent to least recent.
 * @param volume array of daily volume from most recent to least recent.
 * @param period the number of days to calculate mfi for
 */
export function mfi(highs: Array<number>, lows: Array<number>, close: Array<number>, volume: Array<number>, period: number): number {
    let typicalPriceYesterday;
    let positiveMoneyFlow: number = 0;
    let negativeMoneyFlow: number = 0;
    for (let i = 0; i < period; i++) {
        let typicalPriceToday;
        if (!typicalPriceYesterday) {
            typicalPriceToday = (highs[i] + lows[i] + close[i]) / 3;
        } else {
            typicalPriceToday = typicalPriceYesterday;
        }
        typicalPriceYesterday = (highs[i + 1] + lows[i + 1] + close[i + 1]) / 3;
        const moneyFlow = typicalPriceToday * volume[i];
        if (typicalPriceToday > typicalPriceYesterday) {
            positiveMoneyFlow += moneyFlow;
        } else {
            negativeMoneyFlow += moneyFlow;
        }
    }
    const moneyFlowRatio = positiveMoneyFlow / negativeMoneyFlow;
    return (100 - (100 / (1 + moneyFlowRatio)));
}

