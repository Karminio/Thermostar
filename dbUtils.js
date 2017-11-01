var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('templog.db');

var i;

module.exports = {
    writeTemps: function (values){
    	try{
            console.log("Thermostat - writeTemps - WRITING...");
            // (timestamp DATETIME, temp FLOAT, temp2 FLOAT, temp3 FLOAT, tempExt FLOAT, heating BOOLEAN, setTemp FLOAT, heatingZone INTEGER DEFAULT 0, heatingCount INTEGER)
            command = "INSERT INTO temps values(datetime('now'),?,?,?,?,?,?,0,?)";
            db.run(command, [ 
                values.bedRoom,
                values.livingRoom,
                values.annaLeoRoom,
            	values.externalTemp,
            	values.heating, 
            	values.highTargetTemp,
            	values.heatingCount 
            	]);
            /*var stmt = db.prepare("INSERT INTO temps values(datetime('now'),?,?,0,?,?,?,0,?)");
    		  for (var i = 0; i < 10; i++) {
    		      stmt.run("Ipsum " + i);
    		  }
    		  stmt.finalize();*/
        }
        catch(err)
        {
        	console.log('Exception occurred while saving temps to DB!!!' + err);
        }
    },

    /*
    CREATE TABLE IF NOT EXISTS targetTemps (tt0 FLOAT, tt1 FLOAT, tt2 FLOAT, tt3 FLOAT, tt4 FLOAT, tt5 FLOAT, tt6 FLOAT, tt7 FLOAT, tt8 FLOAT, tt9 FLOAT, tt10 FLOAT, tt11 FLOAT, tt12 FLOAT, tt13 FLOAT, tt14 FLOAT, tt15 FLOAT, tt16 FLOAT, tt17 FLOAT, tt18 FLOAT, tt19 FLOAT, tt20 FLOAT, tt21 FLOAT, tt22 FLOAT, tt23 FLOAT, z0 INTEGER, z1 INTEGER, z2 INTEGER, z3 INTEGER, z4 INTEGER, z5 INTEGER, z6 INTEGER, z7 INTEGER, z8 INTEGER, z9 INTEGER, z10 INTEGER, z11 INTEGER, z12 INTEGER, z13 INTEGER, z14 INTEGER, z15 INTEGER, z16 INTEGER, z17 INTEGER, z18 INTEGER, z19 INTEGER, z20 INTEGER, z21 INTEGER, z22 INTEGER, z23 INTEGER)
    INSERT INTO targetTemps values(8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
    */
    setTargetTemps: function(data){
        try{
            console.log("Thermostat - setTargetTemps - WRITING...");
            // (timestamp DATETIME, temp FLOAT, temp2 FLOAT, temp3 FLOAT, tempExt FLOAT, heating BOOLEAN, setTemp FLOAT, heatingZone INTEGER DEFAULT 0, heatingCount INTEGER)
            var command = "UPDATE targetTemps set tt0=?, tt1=?,tt2=?,tt3=?,tt4=?,tt5=?,tt6=?,tt7=?,tt8=?,tt9=?,tt10=?,tt11=?,tt12=?,tt13=?,tt14=?,tt15=?,tt16=?,tt17=?,tt18=?,tt19=?,tt20=?,tt21=?,tt22=?,tt23=?, z0=?, z1=?, z2=?,z3=?,z4=?, z5=?, z6=?,z7=?,z8=?, z9=?, z10=?,z11=?,z12=?, z13=?, z14=?,z15=?,z16=?, z17=?, z18=?,z19=?, z20=?, z21=?, z22=?,z23=?";
            db.run(command, [ 
                data.targetTemps[0], data.targetTemps[1], data.targetTemps[2], data.targetTemps[3],
                data.targetTemps[4], data.targetTemps[5], data.targetTemps[6], data.targetTemps[7],
                data.targetTemps[8], data.targetTemps[9], data.targetTemps[10], data.targetTemps[11],
                data.targetTemps[12], data.targetTemps[13], data.targetTemps[14], data.targetTemps[15],
                data.targetTemps[16], data.targetTemps[17], data.targetTemps[18], data.targetTemps[19],
                data.targetTemps[20], data.targetTemps[21], data.targetTemps[22], data.targetTemps[23],
                data.zones[0], data.zones[1], data.zones[2], data.zones[3],
                data.zones[4], data.zones[5], data.zones[6], data.zones[7],
                data.zones[8], data.zones[9], data.zones[10], data.zones[11],
                data.zones[12], data.zones[13], data.zones[14], data.zones[15],
                data.zones[16], data.zones[17], data.zones[18], data.zones[19],
                data.zones[20], data.zones[21], data.zones[22], data.zones[23]
                ]);
        }
        catch(err)
        {
            console.log('Exception occurred while saving targetTemps to DB!!!' + err);
        }
    },

    getTargetTemps: function(){
        var data = {};
        var t = [];
        var z = [];
        try{
            console.log("Thermostat - getTargetTemps - LOADING...");
            // (timestamp DATETIME, temp FLOAT, temp2 FLOAT, temp3 FLOAT, tempExt FLOAT, heating BOOLEAN, setTemp FLOAT, heatingZone INTEGER DEFAULT 0, heatingCount INTEGER)
            var command = 'SELECT * from targetTemps';
            db.each(command, function(err, row) { 
                t.push(row.tt0); 
                t.push(row.tt1); 
                t.push(row.tt2); 
                t.push(row.tt3); 
                t.push(row.tt4); 
                t.push(row.tt5); 
                t.push(row.tt6); 
                t.push(row.tt7); 
                t.push(row.tt8); 
                t.push(row.tt9); 
                t.push(row.tt10); 
                t.push(row.tt11); 
                t.push(row.tt12); 
                t.push(row.tt13); 
                t.push(row.tt14); 
                t.push(row.tt15); 
                t.push(row.tt16); 
                t.push(row.tt17); 
                t.push(row.tt18); 
                t.push(row.tt19); 
                t.push(row.tt20); 
                t.push(row.tt21); 
                t.push(row.tt22); 
                t.push(row.tt23);
                z.push(row.z0); 
                z.push(row.z1); 
                z.push(row.z2); 
                z.push(row.z3); 
                z.push(row.z4); 
                z.push(row.z5); 
                z.push(row.z6); 
                z.push(row.z7); 
                z.push(row.z8); 
                z.push(row.z9); 
                z.push(row.z10); 
                z.push(row.z11); 
                z.push(row.z12); 
                z.push(row.z13); 
                z.push(row.z14); 
                z.push(row.z15); 
                z.push(row.z16); 
                z.push(row.z17); 
                z.push(row.z18); 
                z.push(row.z19); 
                z.push(row.z20); 
                z.push(row.z21); 
                z.push(row.z22); 
                z.push(row.z23);

            }); 

            data.tt = t;
            data.zz = z;
        }
        catch(err)
        {
            console.log('Exception occurred while loading targetTemps from DB!!!' + err);
        }

        return data;
    },

    readMinMaxAvgTemps: function(callback){

        var data = {};

        try{
            console.log("Thermostat - readMinMaxAvgTemps: sql connected!! ");
            var command = "SELECT MIN(temp) as min, MAX(temp) as max, MIN(tempExt) as minext, MAX(tempExt) as maxext, round(AVG(tempExt),2) as avgext, round(AVG(temp),2) as avgint FROM temps where TIMESTAMP > datetime('now','start of day')";

            db.each(command, function(err, row) { 
                data.min = row.min;
                data.max = row.max;
                data.minExt = row.minext;
                data.maxExt = row.maxext;
                data.avgExt = row.avgext;
                data.avgInt = row.avgint;
                var logMessage = 
                'Thermostat - readMinMaxAvgTemps:\n' +
                'Internal min temp: ' + row.min + '\n' +
                'Internal max temp: ' + row.max + '\n' +
                'External min temp: ' + row.minext + '\n' +
                'External min temp: ' + row.maxext + '\n' +
                'External average temp: ' + row.avgext + '\n' +
                'Internal average temp: ' + row.avgint + '\n';

                console.log(logMessage);

                callback(data);
            });

        }
        catch(err)
        {
            console.log('Exception occurred while loading MinMaxTemps from DB!!!' + err);
        }
    },

    calculateHistoricalStats: function(start, end, callback){

        var data = {};

        try{
            console.log("Thermostat - calculateHistoricalStats: ");
            //var command = "SELECT ((20 * sum(heatingcount))/60) as minutes, ROUND(avg(tempExt),2) as avg FROM temps where TIMESTAMP > '?' and TIMESTAMP < '?'";
            var command = "SELECT ((20 * sum(heatingcount))/60) as minutes, ROUND(avg(tempExt),2) as avg FROM temps where TIMESTAMP > datetime('"+ start +"','utc') and TIMESTAMP < datetime('"+ end + "','utc')";
            console.log(command);
            db.each(command, 
                //[start, end],
                function(err, row) { 
                console.log(row);
                data.min = row.minutes;
                data.avg = row.avg;

                var logMessage = 'Thermostat - calculateHistoricalStats. Minutes: ' + data.min + '  - Average temp:' + data.avg;
                console.log(logMessage);

                callback(data);
            });
        }
        catch(err)
        {
            console.log('Exception occurred while loading MinMaxTemps from DB!!!' + err);
        }
    },

    getHeatingMinutes: function(rangeInHours, callback){
        var data = {};
        var parameterHours = '-' + rangeInHours + ' hour';

        try{
            console.log("Thermostat - getHeatingMinutes: sql connected!! ");
            var command = "SELECT ((20 * sum(heatingcount))/60) as minutes FROM temps where TIMESTAMP > datetime('now',?)";

            db.each(command, [parameterHours], function(err, row) { 
                data.rangeHours = rangeInHours;
                data.minutes = row.minutes;
                callback(data);
            });

        }
        catch(err)
        {
            console.log('Exception occurred while loading MinMaxTemps from DB!!!' + err);
        }       
    },

    getLog: function(start, end, callback){
        var data = {};
        var rows = new Array();

        try{
            console.log("Thermostat - getLog: sql connected!! ");
            var command = "SELECT timestamp, temp, temp2, temp3, tempExt FROM temps where TIMESTAMP > datetime('"+ start +"','utc') and TIMESTAMP < datetime('"+ end + "','utc')";
            console.log(command);
            var rowNum = 0;
            /*db.each(command, function(err, row) { 

                console.log(row);
                //rows.push(rows[inx].timestamp + ' ' + rows[inx].temp + ' ' + rows[inx].temp2 + ' ' + rows[inx].temp3 + ' ' + rows[inx].tempExt);
                rows.push(row);
                rowNum++;
            });*/

            db.all(command, function(err, rows){
                if (err){
                    // call your callback with the error
                    callback(err);
                    return;
                }
                // call your callback with the data
                console.log('dbUtils.getLog: ' + rows);
                callback(rows);

                return;
            });

            /*data.results = rows;
            console.log('data.results:' + data.results.length);
            callback(data); */           

        }
        catch(err)
        {
            console.log('Exception occurred while loading Log from DB!!!' + err);
        }
    }
}