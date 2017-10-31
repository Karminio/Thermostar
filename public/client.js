window.onload = function() {

    var temps = [];

    var socket;

    if(pingLocalServer()){
        socket = io.connect('http://192.168.0.110:8000');
    }
    else{
        socket = io.connect('http://karminio.ddns.net:7000');
    }
    var setButton = document.getElementById("set");
    var getTempsButton = document.getElementById("getTemps");
    var checkButton = document.getElementById("check");
    var manualRunButton = document.getElementById("manualRun");
    var statsButton = document.getElementById("stats");
    var content = document.getElementById("content");
    var gaugeExt = document.getElementById("gaugeExt");
    var gaugeDani = document.getElementById("gaugeDani");
    var gaugeLiving = document.getElementById("gaugeLiving");

    /*socket.on('connect', function(){
        var delivery = new Delivery(socket);

        delivery.on('receive.start',function(fileUID){
            console.log('receiving a file!');
        });

        delivery.on('receive.success',function(file){
          var params = file.params;
          //if (file.isImage()) {
          //  $('img').attr('src', file.dataURL());
          //};
        });
    });*/

    socket.on('temps', function (data) {
        if(data) {
            var html = '';

            html += 'Esterna: ' + data.tempExt + '°C ' + data.trendExt + '<br />';
            html += 'Dani: ' + data.tempDani + '°C ' + data.trendDani + '<br />';
            html += 'Anna & Leo: ' + data.tempAnnaLeo + '°C ' + data.trendAnnaLeo + '<br />';
            html += 'Sala: ' + data.tempSala + '°C ' + data.trendSala + '<br />';
            /*html += 'Minima int.: ' + data.min + '°C<br />';
            html += 'Massima int.: ' + data.max + '°C<br />';
            html += 'Minima ext: ' + data.minExt + '°C<br />';
            html += 'Massima est.: ' + data.maxExt + '°C<br />';*/
            html += 'U. accensione: ' + data.lastHeatingOn + '<br />';
            if(data.heating){
                html += '<b>Heating ON</b>';
            }
            if(data.manualRun){
                html += '<b>Manual run ON</b>';
            }
            if(data.paused){
                html += '<b>Paused</b>';
            }
            if(data.testMode){
                html += '<b>+++TEST+++</b>';
            }
            content.innerHTML = html;
            console.log('Temps received at ' + (new Date()).toLocaleTimeString());
            refreshGauges(data.tempExt, data.tempDani, data.tempSala, data.heating, data.heatingZone);
        } else {
            console.log('There is a problem getting temps');
        }
    });

    socket.on('targetTemps', function (data) {
        if(data) {
            var tt = data.tt;
            var zz = data.zz;

            for(var hour=0;hour<24;hour++){
                var range = document.getElementById('rTemp'+hour);
                var radio0 = document.getElementById('rbTemp'+hour+'_0');
                var radio1 = document.getElementById('rbTemp'+hour+'_1');
                var field = document.getElementById('tempLabel'+hour);
                range.value = tt[hour];
                radio0.checked = zz[hour] ? 0 : 1;
                radio1.checked = !radio0.checked;
                field.innerHTML = tt[hour];
            }
        } else {
            console.log('There is a problem: getting targetTemps');
        }
    });

    setButton.onclick = function() {
        var targetTemps = [];
        var zones = [];
        for(var t=0;t<24;t++){
            var range = document.getElementById('rTemp'+t);
            var radio = document.getElementById('rbTemp'+t+'_0');
            targetTemps.push(range.value);
            zones.push(radio.checked ? 0 : 1);
        }
        var data = {targetTemps: targetTemps, zones:zones};
        socket.emit('setTargetTemps', data);
    };

    getTempsButton.onclick = function() {
        socket.emit('getTemps', { });
    };

    checkButton.onclick = function() {
        socket.emit('check', { });
    };

    manualRunButton.onclick = function() {
        socket.emit('manual', { });
    };

    /*getDBButton.onclick = function() {
        var delivery = new Delivery(socket);

        delivery.on('receive.start',function(fileUID){
          console.log('receiving a file!');
        });

        delivery.on('receive.success',function(file){
          var params = file.params;
          if (file.isImage()) {
            $('img').attr('src', file.dataURL());
          };
        });
    };*/

    /*statsButton.onclick = function() {
      window.location='/stats';
      //httpGet('/stats');
    }*/
    
    socket.emit('getTemps', { });
    socket.emit('getTargetTemps', { });    

    refreshGauges();
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

function refreshGauges(ext, dani, living, heating, heatingZone){

    var body = document.getElementById("pageBody");    

    if(ext){

        body.removeChild(body.childNodes[0]);
        body.removeChild(body.childNodes[0]);
        body.removeChild(body.childNodes[0]);
    }

    var divExt = document.createElement('div');
    divExt.id = 'gaugeExt';
    divExt.className = 'tempGaugeExt';
    divExt.innerHTML = ext  + '&deg;C';
    body.insertBefore(divExt, body.childNodes[0]);

    var divDani = document.createElement('div');
    divDani.id = 'gaugeDani';
    divDani.className = 'tempGaugeDani';
    divDani.innerHTML = dani + '&deg;C';
    body.insertBefore(divDani, body.childNodes[1]);

    var divLiving = document.createElement('div');
    divLiving.id = 'gaugeLiving';
    divLiving.className = 'tempGaugeLiving';
    divLiving.innerHTML = living + '&deg;C';
    body.insertBefore(divLiving, body.childNodes[2]);    

    $(".tempGaugeExt").tempGauge({
      borderWidth: 2,
      fillColor: "blue",
      showLabel:true,
      labelSize: 12,
      maxTemp: 40,
      minTemp: -10,
      width: 50
    });

    $(".tempGaugeDani").tempGauge({
      borderWidth: 2,
      borderColor: (heating && heatingZone == 0)? "red" : "black",
      fillColor: "orange",
      showLabel:true,
      labelSize: 12,
      maxTemp: 40,
      minTemp: -10,
      width: 50
    });

    $(".tempGaugeLiving").tempGauge({
      borderWidth: 2,
      borderColor: (heating && heatingZone == 1)? "red" : "black",
      fillColor: "brown",
      showLabel:true,
      labelSize: 12,
      maxTemp: 40,
      minTemp: -10,
      width: 50
    });
}

function updateLabelValue(t) {
    var range = document.getElementById('rTemp'+t);
    var field = document.getElementById('tempLabel'+t);
    field.innerHTML = range.value;
}

function httpGet(url)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', url, true); // false for synchronous request
    xmlHttp.send();
    return xmlHttp.responseText;
}
