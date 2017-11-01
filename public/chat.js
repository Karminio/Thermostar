window.onload = function() {

    var temps = [];
    var socket = io.connect('http://localhost:8000');
    var field = document.getElementById("field");
    var setButton = document.getElementById("set");
    var getTempsButton = document.getElementById("getTemps");
    var content = document.getElementById("content");

    socket.on('temps', function (data) {
        if(data.temp) {
            temps.push(data.temp);
            var html = '';
            for(var i=0; i<temps.length; i++) {
                html += temps[i] + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });

    setButton.onclick = function() {
        var text = field.value;
        socket.emit('set', { temp: text });
    };

    getTempsButton.onclick = function() {
        var text = field.value;
        socket.emit('getTemps', { });
    };
}

//function printValue(sliderID, textbox) {
function printValue(t) {
    var range = document.getElementById('rTemp'+t);
    var field = document.getElementById('vTemp'+t);
    field.value = range.value;
}
