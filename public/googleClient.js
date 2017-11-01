window.onload = function() {

    var rawData;
    var historyData;
    var socket = io.connect('http://karminio.ddns.net:7000');
    var calcButton = document.getElementById("calculate");
    var queryString = location.search.substring(1);
    var vars = queryString.split('&');

    if(localStorage.minutes) {
        var pageBody = document.getElementById("pageBody");
        var resultDiv = document.createElement('div');
        resultDiv.className = 'base';
        pageBody.appendChild(resultDiv);

        var minDiv = document.createElement('div');
        minDiv.innerHTML = localStorage.minutes;
        resultDiv.appendChild(minDiv);

        var avgTempDiv = document.createElement('div');
        avgTempDiv.innerHTML = localStorage.avgTemp;
        resultDiv.appendChild(avgTempDiv);

        localStorage.removeItem('minutes');
        localStorage.removeItem('avgTemp');
    }

    socket.on('historyDataReceived', function (data) {
        if(data) {
            historyData = data;
            //displayData(rawData, historyData, content);

            var logMessage = 'Thermostat - historyDataReceived. Minutes: ' + data.min + '  - Average temp:' + data.avg;

            localStorage.minutes = data.min;
            localStorage.avgTemp = data.avg;

            console.log(logMessage);
        } else {
            console.log('There is a problem getting historical data');
        }
    });

    if(queryString != ''){

        var urlParams = new URLSearchParams(window.location.search);
        var dateStart = urlParams.get('start');
        var dateEnd = urlParams.get('end');

        var jsStart = new Date(dateStart);
        var jsEnd = new Date(dateEnd);

        socket.emit('calculateHistoryData', { start: jsStart, end: jsEnd });
    }

/*
    socket.on('historyDataReceived', function (data) {
        if(data) {
            historyData = data;
            displayData(rawData, historyData, content);
            var logMessage = 'Thermostat - historyDataReceived. Minutes: ' + data.min + '  - Average temp:' + data.avg;
            console.log(logMessage);
        } else {
            console.log('There is a problem getting historical data');
        }
    });

    socket.on('statsReceived', function (data) {
        if(data) {
            rawData = data;
            displayData(rawData, historyData, content);
        } else {
            console.log('There is a problem getting stats');
        }
    });

    socket.emit('getStats', { });    */
}

function sendHistoricalData(start, end){
        var dbUtils = require('./dbUtils.js');
    dbUtils.calculateHistoricalStats(start, end, function(results){
        io.sockets.emit('historyDataReceived', results);
    })
}

function retrieveData(raw, historical, content){

    var html = '';

    if(raw){
        html += 'Minima int: ' + raw[3].min + '°C<br />';
        html += 'Media int: ' + raw[3].avgInt + '°C<br />';            
        html += 'Massima int: ' + raw[3].max + '°C<br />';
        html += 'Minima ext: ' + raw[3].minExt + '°C<br />';
        html += 'Media ext: ' + raw[3].avgExt + '°C<br />';
        html += 'Massima est: ' + raw[3].maxExt + '°C<br /><hr><br />';

        html += 'Minuti accensione ultime 2h: ' + raw[0].minutes + '<br />';
        html += 'Minuti accensione ultime 12h: ' + raw[1].minutes + '<br />';
        html += 'Minuti accensione ultime 24h: ' + raw[2].minutes + '<br /><hr><br />';
    }

    if(historical){
        html += 'Minuti accensione range: ' + historical.min + '<br />';
        html += 'Media ext range: ' + historical.avg + '°C<br />';
    }   

    content.innerHTML = html;
}
