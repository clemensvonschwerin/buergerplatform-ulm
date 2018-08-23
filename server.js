/*server.js*/

//Bootstrap template from https://startbootstrap.com/template-overviews/sb-admin/

const http = require('http');
const url = require('url');
const fs = require('fs');
const express = require('express');
const path = require('path');
const sensor_selection = require('./js/sensor_selection')

const app = express();

const hostname = '0.0.0.0';
const port = 3003;

/*const sensorQuery = encodeURI('http://127.0.0.1:8086/query?db=loradata;q=SHOW TAG VALUES FROM autogen.peoplecounter WITH KEY = "busstop"');
const fieldsQuery = encodeURI('http://127.0.0.1:8086/query?db=loradata;q=SHOW FIELD KEYS FROM autogen.peoplecounter');

var availablePeoplecounters = [];
var availableFields = [];
http.get(sensorQuery, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
        data += chunk;
    });
    resp.on('end', () => {
        obj = JSON.parse(data);
        busstops = obj.results[0].series[0].values;
        for(i=0; i<busstops.length; i++) {
            availablePeoplecounters.push(busstops[i][1]);
        }
    });
});
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
    });
}); */

app.use('/vendor', express.static(__dirname + '/vendor'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/scss', express.static(__dirname + '/scss'));

app.set('view engine', 'ejs');

/* Init all variables to default value */
app.use(function (req, res, next) {
    res.locals.activepage = null;
    next();
});

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.get('/index', function(req, res) {
    res.render('pages/index');
});

var availablePeoplecounters=[];
var availableFields = [];

var pcf = function(req, res, next) {
    sensor_selection.runOnAvailablePeoplecounters(function(peoplecounters){
        availablePeoplecounters = peoplecounters;
        //console.log('Haltestellen ' + availablePeoplecounters);
        next();
    });
}

var ff = function(req, res, next) {
    sensor_selection.runOnAvailableFields(function(fields){
        availableFields = fields;
        //console.log('Fields ' + availableFields);
        next();
    });
}

var renderf = function(req, res) {
    res.render('pages/sensor_selection', {peoplecounters: {stops: availablePeoplecounters, fields: availableFields}});
};

app.get('/sensor_selection', [pcf, ff, renderf]);

app.get('*', function(req, res) {
    res.render('pages/404');
});

app.listen(port, function(){
    console.log("Server started at port " + port);
});