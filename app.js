var express = require('express');
var app = express();
var path = require('path');
var dbUtils = require('./dbUtils');
var sensor = require('ds18x20');
var Gpio = require('onoff').Gpio;
//var dl = require('delivery');
var io = null;
var paused = false;
var pauseMinutes = 15;
var pauseTimeout = null;
var manualRun = false;
var manualRunMinutes = 15;
var manualRunTimeout = null;
var monitoredTemp = 20.0;
var highTargetTemp = 8.0;   
var lastReadings = new Array();
var testMode = false;

// Variables
/*
{ '28-0000067c9752': LivingRoomSensor,
  '28-0000067ce06b': DaniRoomSensor,
  '28-0000067c3757': ExternalSensor,
  '28-0000067c1dbb': 
  '28-0000067a81d4': 
  '28-0000067bb2ba': 
  '28-0000067a17ab': AnnaLeoRoom  }
*/
var DaniRoomSensor = '28-0000067ce06b', AnnaLeoRoomSensor = '28-0000067a17ab', ExternalSensor = '28-0000067c3757', LivingRoomSensor = '28-0000067c9752' ;
var writeOnDBiteration = 1,
  heating = false, 
  targetZone = 0,
  lastHeatingOn = null,
  heatingCount = 0,
  minInt = -10,
  maxInt = 50,
  minExt = -10,
  maxExt = 50,
  externalTemp = 
  daniRoomTemp = 
  annaLeoRoomTemp =
  livingRoomTemp = 50;
  externalTrend = 
  daniRoomTrend = 
  annaLeoRoomTrend =
  livingRoomTrend = '';

var targetTemps = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
var zones = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var heaterRelay = null; 

// Init cvlapper
var clapper = new Gpio(21, 'in', 'both');
var clapCount = 0;

// Init relay
heaterRelay = new Gpio(27, 'high');
heaterRelay.writeSync(1); // Immediately shuts off heater

// Init express and pug
function init(){
    app.set('views', __dirname + '/tpl');
    app.set('view engine', "pug");
    app.engine('pug', require('pug').__express);

    app.get("/", function(req, res){
        res.render("page");
    });

    app.get("/stats", function(req, res){
        res.render("stats");
    });

    app.get("/google", function(req, res){
        //res.sendFile(path.join(__dirname + '/google/toGoogleSheets.html'));
        res.render("google");
    });

    app.get("/pause", function(req, res){
        pauseHeating();
        res.render("pause");
    });

    app.get("/resume", function(req, res){
        paused = false;
        clearTimeout(pauseTimeout);
        res.render("page");
    });

    app.use(express.static(__dirname + '/public'));

    // Init socket
    var port = 8000;
    io = require('socket.io').listen(app.listen(port));

    // Init target temps
    var ttemps = dbUtils.getTargetTemps();
    targetTemps = ttemps.tt;
    zones = ttemps.zz;

    io.sockets.on('connection', function (socket) {
            socket.emit('message', { message: 'welcome to the chat' });
            socket.on('send', function (data) {
                io.sockets.emit('message', data);
        });

        socket.on('getTemps', function () {
            sendTempData();
        });

        socket.on('getLog', function (params) {
            dbUtils.getLog(params.start, params.end, function(results){
                console.log('logDataReceived - records: ' + results);
                io.sockets.emit('logDataReceived', results);
            })
        });

        socket.on('setTargetTemps', function (data) {
            console.log('onSetTargetTemps: ' + data.length);
            if(data && data.targetTemps && data.zones){
                targetTemps = data.targetTemps;
                zones = data.zones;
                dbUtils.setTargetTemps(data);
                io.sockets.emit('targetTempsSetOK');
                console.log('targetTempsSetOK: ' + data);
            }
        });

        socket.on('getTargetTemps', function (data) {
            var data = {};
            data.tt = targetTemps;
            data.zz = zones;
            io.sockets.emit('targetTemps', data);
        });

        socket.on('check', function (){
            var tempObj = sensor.getAll();
            console.log(tempObj);
        });

        socket.on('manual', function (){
            manualRun = true;
            manualRunTimeout = setTimeout(function(){ manualRun = false}, manualRunMinutes * 60000);
        });

        socket.on('toggleTestMode', function (){
            testMode = !testMode;
            console.log('testMode is: ' + testMode);
        });

        /*socket.on('getDB', function(sk){
            var delivery = dl.listen(sk);
            delivery.on('delivery.connect',function(delivery){

                delivery.send({
                    name: 'templog.db',
                    path : './templog.db',
                    params: {foo: 'db'}
                });

                delivery.on('send.success',function(file){
                console.log('File successfully sent to client!');
                });

            });
        });*/

        socket.on('getStats', function () {
            sendStatsData();      
        });

        socket.on('calculateHistoryData', function (params) {
            sendHistoricalData(params);      
        });
    });

    clapper.watch(function () {

        console.log('Noise detected!! - count: ' + ++clapCount);
    });
};

init();

var interval = setInterval(function(str1, str2) {
	checkTemps();
}, 15000);

function pauseHeating(){
    // This command stops heating for 15 minutes
    paused = true;
    pauseTimeout = setTimeout(function(){ paused = false}, pauseMinutes * 60000);
}

function sendTempData(){
    var data = {};

    data.trendExt = externalTrend;
    data.trendDani = daniRoomTrend;
    data.trendAnnaLeo = annaLeoRoomTrend;
    data.trendSala = livingRoomTrend;    

    data.tempExt = externalTemp;
    data.tempDani = daniRoomTemp;
    data.tempAnnaLeo = annaLeoRoomTemp;
    data.tempSala = livingRoomTemp;

    data.lastHeatingOn = lastHeatingOn;
    data.heating = heating;
    data.manualRun = manualRun;
    data.heatingZone = targetZone;
    data.paused = paused;
    data.testMode = testMode;
    io.sockets.emit('temps', data);
}

function sendLogData(){
    var data = {};
    data.tempExt = externalTemp;
    data.tempDani = daniRoomTemp;
    data.tempAnnaLeo = annaLeoRoomTemp;
    data.tempSala = livingRoomTemp;
    data.lastHeatingOn = lastHeatingOn;
    data.heating = heating;
    /*data.min = minInt;
    data.max = maxInt;
    data.minExt = minExt;
    data.maxExt = maxExt;*/
    data.heatingZone = targetZone;
    io.sockets.emit('temps', data);
}

function sendStatsData(){
    var range2Hr = new Promise(function(resolve, reject) { 
        dbUtils.getHeatingMinutes(2, function(data2hr){
            resolve(data2hr);
        })
    });
    var range12Hr = new Promise(function(resolve, reject) { 
        dbUtils.getHeatingMinutes(12, function(data12hr){
            resolve(data12hr);
        })
    });
    var range24Hr = new Promise(function(resolve, reject) { 
        dbUtils.getHeatingMinutes(24, function(data24hr){
            resolve(data24hr);
        })
    });
    var minMaxAvg = new Promise(function(resolve, reject) { 
        dbUtils.readMinMaxAvgTemps(function(dataMinMaxAvg){
            resolve(dataMinMaxAvg);
        })
    });

    Promise.all([range2Hr, range12Hr, range24Hr,minMaxAvg]).then(function(results) {
        //console.log('Then: ', results);
        io.sockets.emit('statsReceived', results);
    }).catch(function(err) {
        console.log('Catch: ', err);
    });
}

function sendHistoricalData(params){
    dbUtils.calculateHistoricalStats(params.start, params.end, function(results){
        io.sockets.emit('historyDataReceived', results);
    })
}

function getFormattedDateTime(){
	var data = new Date();
	var d, m, y, Hh, Mm, Ss;
	d = data.getDate() + "/";
	m = data.getMonth() + "/";
	y = data.getYear() + " -- ";
	Hh = data.getHours() + ":";
	Mm = data.getMinutes() + ":";
	Ss = data.getSeconds();
	timeStampString = d + m + y + Hh + Mm + Ss;
	return timeStampString;
}

function loadSensorsValues(){
    var loadDaniRoomTemp = new Promise(
        function(resolve, reject) { 
            resolve(sensor.get(DaniRoomSensor));
        });

    var loadAnnaLeoRoomTemp = new Promise(function(resolve, reject) { 
            resolve(sensor.get(AnnaLeoRoomSensor));
        });

    var loadLivingRoomTemp = new Promise(function(resolve, reject) { 
            resolve(sensor.get(LivingRoomSensor));
        });

    var loadExternalTemp = new Promise(function(resolve, reject) { 
            resolve(sensor.get(ExternalSensor));
        });

    Promise.all([loadDaniRoomTemp, loadAnnaLeoRoomTemp, loadLivingRoomTemp, loadExternalTemp]).then(function(results) {

        setTempAndTrend(results);

    }).catch(function(err) {
        console.log('A problem occurred loading temps from sensors - Error: ', err);

        // set temps to default to prevent continuous unwanted heating
        daniRoomTemp = 20;
        annaLeoRoomTemp = 20;        
        livingRoomTemp = 20;
        externalTemp = 20;
    });

    /*daniRoomTemp = sensor.get(DaniRoomSensor);
    livingRoomTemp = sensor.get(LivingRoomSensor);
    externalTemp = sensor.get(ExternalSensor);*/
}

function setTempAndTrend(results){

    if(daniRoomTemp == results[0]) daniRoomTrend = '';
    else if(daniRoomTemp > results[0]) daniRoomTrend = '˄';
    else daniRoomTrend = '˅';

    if(annaLeoRoomTemp == results[0]) annaLeoRoomTrend = '';
    else if(annaLeoRoomTemp > results[0]) annaLeoRoomTrend = '˄';
    else annaLeoRoomTrend = '˅';

    if(livingRoomTemp == results[0]) livingRoomTrend = '';
    else if(livingRoomTemp > results[0]) livingRoomTrend = '˄';
    else livingRoomTrend = '˅';

    if(externalTemp == results[0]) externalTrend = '';
    else if(externalTemp > results[0]) externalTrend = '˄';
    else externalTrend = '˅';

    daniRoomTemp = results[0];
    annaLeoRoomTemp = results[1];        
    livingRoomTemp = results[2];
    externalTemp = results[3];
}

function checkTemps(){

    console.log('-------------------------------------');    

    currentTargetTemp = getCurrentTimeTemp();
    var newHighTargetTemp = parseFloat(currentTargetTemp);
    targetZone = getCurrentTimeZone();

    console.log('Current zone: '+ targetZone);

    if (targetZone == 0){
        console.log("Monitoring bedroom");
        monitoredTemp = daniRoomTemp;
    }
    else if (targetZone == 1){
        console.log("Monitoring livingroom");
        monitoredTemp = livingRoomTemp;
    }

    
    var previousTemp = monitoredTemp;

    if(highTargetTemp != newHighTargetTemp){
        // Zone/target temp changed
        lastReadings = [];
    }
    highTargetTemp = newHighTargetTemp;

    lastReadings.unshift(monitoredTemp);
    console.log('Temp Queue - Lenght: %s - previousTemp: %s - monitoredTemp: %s', lastReadings.length, previousTemp, monitoredTemp );

    // Open window break
    if(lastReadings && lastReadings.length == 4){
        previousTemp = lastReadings.pop();        

        if(previousTemp > (monitoredTemp + 0.2)){
            pauseHeating();
        }
    }    

    if(testMode){
        // Test stuff
    }
    else{
        toggleHeating();
        writeDBData();
    }

    setTimeout(loadSensorsValues(), 5000);

    sendTempData();

    var logMessage = 
    'Timestamp: ' + getFormattedDateTime() + '\n' +
    'Dani room temp: ' + daniRoomTemp + '\n' +
    'Anna e Leo room temp: ' + annaLeoRoomTemp + '\n' +
    'Living room temp: ' + livingRoomTemp + '\n' +
    'External temp: ' + externalTemp + '\n' + 
    'Write on DB countdown: '+ (10 - writeOnDBiteration) + ' iterations\n' +
    'Heating paused: ' + paused + '\n';

    console.log(logMessage);
}

function toggleHeating(){
    if ((paused || (monitoredTemp > (highTargetTemp + 0.2))) && !manualRun){
        console.log('Heating Off -- Monitored: %s -- Target: %s', monitoredTemp,highTargetTemp );
        heating = false;
        heaterRelay.writeSync(1);
    }
    else if ((monitoredTemp < highTargetTemp) || manualRun){
        console.log('Heating On -- Monitored: %s -- Target: %s', monitoredTemp,highTargetTemp );
        heating = true;
        heatingCount+=1;
        heaterRelay.writeSync(0);
        var d = new Date();
        lastHeatingOn = d.toLocaleTimeString();
    }
    else{
        if (heating){
            heatingCount += 1
            var d = new Date();
            lastHeatingOn = d.toLocaleTimeString();    
        }
        console.log('Wait zone -- Monitored: %s -- Target: %s', monitoredTemp,highTargetTemp );
    }
}

function writeDBData(){
    writeOnDBiteration+=1;

    if(writeOnDBiteration < 0 || writeOnDBiteration > 10){
        writeOnDBiteration = 5;
    }

    if(writeOnDBiteration == 10 && isTempReadingValid()){

        dbUtils.writeTemps({
            bedRoom: daniRoomTemp,
            livingRoom: livingRoomTemp,
            annaLeoRoom: annaLeoRoomTemp,            
            externalTemp: externalTemp,
            heating: heating,
            highTargetTemp: highTargetTemp,
            heatingCount: heatingCount
        });

        //dbUtils.readMinMaxTemps(onLoadMinMaxTemps);        
        
        writeOnDBiteration = 0;
        heatingCount = 0;
    }
}

function isTempReadingValid(){
    var valid = daniRoomTemp != 85 && daniRoomTemp != 50 &&
        annaLeoRoomTemp != 85 && annaLeoRoomTemp != 50 &&
        livingRoomTemp != 85 && livingRoomTemp != 50 &&
        externalTemp != 85 && externalTemp != 50;

    if(!valid){
        console.log('+++ Invalid temp!! +++ ');
    }

    return valid;
}

function onLoadMinMaxTemps(minMaxData){
    minInt = minMaxData.min;
    maxInt = minMaxData.max;
    minExt = minMaxData.minExt;
    maxExt = minMaxData.maxExt;
}

function onLoadHeatingMinutes(minutesData){
    //console.log('Heating minutes in last '+ minutesData.rangeHours +' hours: ' + minutesData.minutes);
    sendStatsData(minutesData);
}

function getCurrentTimeTemp(){
  var currentTargetTemp = 8.0;

  var d = new Date();
  currentHour = d.getHours();
  console.log('getCurrentTimeTemp of hour:' + currentHour);
  currentTargetTemp = targetTemps[currentHour];

  return currentTargetTemp;
}

function getCurrentTimeZone(){
  var currentTargetZone = 0;

  var d = new Date();
  currentHour = d.getHours();
  console.log('getCurrentTimeZone of hour:' + currentHour);
  currentTargetZone = zones[currentHour];

  return currentTargetZone;
}



