export class TAUtils {

    /**
     * Get the simple moving average from a list of numbers.
     * @param values Array of numbers ordered from most recent to least recent.
     * @param range The range to calculate the simple moving average 
     * @returns one SMA value for the most recent data point provided.
     */
    public sma(values: Array<number>, range: number): number {
        const array = values.slice(0, range)
        const sum = array.reduce(function (a, b) {
            return a + b;
        }, 0);
        return (sum / range);
    }

    public ema() {

    }

}