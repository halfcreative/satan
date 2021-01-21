import { VortexIndicatorLines } from "models/EvaluationModel";

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
    const reversedValues = values.slice(0).reverse();
    let sum: number = 0;
    for (let i = 1; i < range + 1; i++) {
        const change: number = reversedValues[i] - reversedValues[i - 1];
        if (gainsOrLosses) {
            if (change > 0) {
                sum += change;
            }
        } else {
            if (change < 0) {
                sum += Math.abs(change);
            }
        }
    }
    return sum / range;
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
    const pv = [];
    //Downtrend Movement
    const nv = [];
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
    const sumPV = pv.splice(0, period).reduce(sum);
    const sumNV = nv.splice(0, period).reduce(sum);
    const sumTR = tr.splice(0, period).reduce(sum);
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
 * @param close 
 */
export function trueRange(high: Array<number>, low: Array<number>, close: Array<number>) {
    const trueRanges = [];
    let range = Math.min(high.length, low.length, close.length) - 1;
    for (let i = 0; i < range; i++) {
        trueRanges.push(Math.max(high[i] - low[i], Math.abs(high[i] - close[i + 1]), Math.abs(low[i] - close[i + 1])));
    }
    return trueRanges;
}
