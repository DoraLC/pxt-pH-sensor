//%color=#04B404 icon="\uf0c3" block="pH-sensor"
namespace ph_sensor {
    /**
     * Get raw data. For calibrating the sensor.
     * Record the data for calculating the pH value.
     */
    //%blockId=raw_data
    //%block="Read raw data pin %pinarg"
    //%pinarg.fieldEditor="gridpicker" pinarg.fieldOptions.columns=3
    export function raw_data(pinarg: AnalogPin): number {
        return pins.analogReadPin(pinarg)
    }

    let readingPin: AnalogPin
    let reading_pH: number
    let row_data: number[]
    let ref_pH: number[]

    function value_sum(value: number[]): number {
        let returnValue = 0
        for (let i = 0; i < value.length; i++) {
            returnValue += value[i]
        }
        return returnValue
    }

    function value_square_sum(value: number[]): number {
        let returnValue = 0
        for (let i = 0; i < value.length; i++) {
            returnValue += value[i] * value[i]
        }
        return returnValue
    }

    function values_times_sum(x: number[], y: number[]): number {
        let returnValue = 0
        for (let i = 0; i < x.length; i++) {
            returnValue += x[i] * y[i]
        }
        return returnValue
    }

    function matrix(x: number[]): number[][] {
        return [[x.length, value_sum(x)], [value_sum(x), value_square_sum(x)]]
    }

    function vector(x: number[], y: number[]): number[] {
        return [value_sum(y), values_times_sum(x, y)]
    }

    function matrix_inveres(x: number[], y: number[]): number[][] {
        let target = matrix(x)
        let d = target[0][0] * target[1][1] - target[0][1] * target[1][0]
        let adj = [[target[1][1], -1 * target[0][1]], [-1 * target[1][0], target[0][0]]]
        let returnValue = [[0, 0], [0, 0]]
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                returnValue[i][j] = adj[i][j] / d
            }
        }
        return returnValue
    }

    export function ab_vector(x: number[], y: number[]): number[] {
        let returnValue = [0, 0]
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                returnValue[i] += matrix_inveres(x, y)[i][j] * vector(x, y)[j]
            }
        }
        return returnValue
    }

    /**
     * Input the raw data and its corresponding pH value.
     * This function will return the pH value by least square method.
     */
    //%blockId=pH_value
    //%block="Calibration | raw data %data|pH %ph|pin %pin_arg"
    //%blockExternalInputs=true
    //%pin_arg.fieldEditor="gridpicker" pin_arg.fieldOptions.columns=3
    //%pin_arg.defl=AnalogPin.P1
    export function calibrate(data = [604, 516], ph = [6.86, 4.01], pin_arg: AnalogPin){
        readingPin = pin_arg
        row_data = data
        ref_pH = ph
    }

    /**
     * Return the pH value. 
     */
    //%block="pH value"
    export function ph_value(): number{
        return ab_vector(row_data, ref_pH)[0] + ab_vector(row_data, ref_pH)[1] * pins.analogReadPin(readingPin)
    }
}