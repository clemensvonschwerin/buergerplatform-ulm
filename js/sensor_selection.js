/*sensor_selection.js*/

const http = require('http');
const request = require('request');

const sensorQuery = encodeURI('http://127.0.0.1:8086/query?db=loradata;q=SHOW TAG VALUES FROM autogen.peoplecounter WITH KEY = "busstop"');
const fieldsQuery = encodeURI('http://127.0.0.1:8086/query?db=loradata;q=SHOW FIELD KEYS FROM autogen.peoplecounter');

var availablePeoplecounters = null;
var availableFields = null;

exports.runOnAvailablePeoplecounters = function(callback) {
    if(availablePeoplecounters == null) {
        //console.log("Querying peoplecounters!");
        availablePeoplecounters = [];
        request(sensorQuery, function(err, resp, data) {
                obj = JSON.parse(data);
                busstops = obj.results[0].series[0].values;
                for(i=0; i<busstops.length; i++) {
                    availablePeoplecounters.push(busstops[i][1]);
                    //console.log("Pushing peoplecounter!");
                }
                callback(availablePeoplecounters);
        });
    }
    else {
        callback(availablePeoplecounters);
    }
    
}

exports.runOnAvailableFields = function(callback) {
    if(availableFields == null) {
        availableFields = [];
        http.get(fieldsQuery, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                obj = JSON.parse(data);
                fields = obj.results[0].series[0].values;
                for(i=0; i<fields.length; i++) {
                    availableFields.push(fields[i][0]);
                }
                callback(availableFields);
            });
        });
    }
    else {
        callback(availableFields);
    } 
}