
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
