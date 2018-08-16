// tests go here; this will not be compiled when this package is used as a library
basic.forever(function () {
    serial.writeNumber(ph_sensor.ph_value([604, 516], [6.86, 4.01], AnalogPin.P1))
    serial.writeLine("")
})