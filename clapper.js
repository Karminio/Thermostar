var Gpio = require('onoff').Gpio;
var count = 0;

var clapperOutput = new Gpio(21, 'in', 'both');

clapperOutput.watch(function () {

  console.log('Noise detected!! - count: ' + ++count);

  clapperOutput.unexport(); // Unexport GPIO and free resources
});


