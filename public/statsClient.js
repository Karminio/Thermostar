window.onload = function() {

    var rawData;
    var historyData;
    var socket;

    if(pingLocalServer()){
        socket = io.connect('http://192.168.0.110:8000');
    }
    else{
        socket = io.connect('http://karminio.ddns.net:7000');
    }
    var content = document.getElementById("content");
    var logArea = document.getElementById("logArea");
    var rangeStart = document.getElementById("rangeStart");
    var rangeEnd = document.getElementById("rangeEnd");
    var calcButton = document.getElementById("calculate");
    var logButton = document.getElementById("log");
    var copyButton = document.getElementById("copy");

    if(!rangeStart.value){
        rangeStart.value = new Date().toISOString().substring(0,11) + '00:00';
        rangeEnd.value = new Date().toISOString().substring(0,11) + '00:00';
    }

    calcButton.onclick = function() {
        console.log('Start: ' + rangeStart.value + ' - End: ' + rangeEnd.value);
        socket.emit('calculateHistoryData', { start: rangeStart.value, end: rangeEnd.value });
    };

    logButton.onclick = function() {
        console.log('Start: ' + rangeStart.value + ' - End: ' + rangeEnd.value);
        socket.emit('getLog', { start: rangeStart.value, end: rangeEnd.value });
    };

    copyButton.onclick = function() {
        var clipboard = new Clipboard('.btn');

        clipboard.on('success', function(e) {
            console.info('Action:', e.action);
            console.info('Text:', e.text);
            console.info('Trigger:', e.trigger);

            e.clearSelection();
        });

        clipboard.on('error', function(e) {
            console.error('Action:', e.action);
            console.error('Trigger:', e.trigger);
        });
    };

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

    socket.on('logDataReceived', function (data) {
        if(data) {
            var htmlText = 'Tempo (UTC)'+
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
            'Dani'+
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
            'Sala'+
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
            'Anna&Leo'+
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
            'Ext<br />';
            for(var inx = 0; inx < data.length; inx++){
                htmlText += data[inx].timestamp + '&nbsp;&nbsp;&nbsp;' + data[inx].temp + '&nbsp;&nbsp;&nbsp;' + data[inx].temp2 + '&nbsp;&nbsp;&nbsp;' + data[inx].temp3 + '&nbsp;&nbsp;&nbsp;' + data[inx].tempExt + ' ' +'<br />';
            }

            logArea.innerHTML = htmlText;

            var logMessage = 'Thermostat - logDataReceived';
            console.log(logMessage);
        } else {
            console.log('There is a problem getting log data');
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

    socket.emit('getStats', { });    
}


function pingLocalServer(){
    var serverip = "192.168.0.110:8000"

    if (serverip != "") {
        var ImageObject = new Image();
        ImageObject.src = "http://" + serverip + "/ping.bmp"; 

        if (ImageObject.height > 0)
        {
            return true;
        } 
        else {
            return false;
        }
    }
}

function displayData(raw, historical, content){

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
