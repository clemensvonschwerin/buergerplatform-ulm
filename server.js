/*server.js*/

//Bootstrap template from https://startbootstrap.com/template-overviews/sb-admin/

const http = require('http');
const url = require('url');
const fs = require('fs');
const express = require('express');
const path = require('path');
const sensor_selection = require('./js/sensor_selection')
const icons = require('glyphicons');
const body_parser = require('body-parser');
const util = require('util');
const session = require('client-sessions');

const app = express();

const hostname = '0.0.0.0';
const port = 3003;

app.use(body_parser.urlencoded());
app.use(body_parser.json());

app.use(session({
    cookieName: 'session',
    secret: 'doay8KQiC6ZFeqxMJMMI4zGLuAx6f0lmGNG3jJRetd56mP0NxbNeCa6D6cE9GVn',
    duration: 1000 * 3600 * 48,
    activeDuration: 1000 * 3600 * 24,
}));

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
    var pc = {};
    if(req.session && req.session.peoplecounters && 
        !(Object.keys(req.session.peoplecounters).length === 0 && req.session.peoplecounters.constructor === Object)) {
        pc = req.session.peoplecounters;
    } else {
        /* Initialize everything as deselected */
        for(i=0; i<availablePeoplecounters.length; i++) {
            pc[availablePeoplecounters[i]] = {};
            for(j=0; j<availableFields.length; j++) {
                pc[availablePeoplecounters[i]][availableFields[j]] = 'off';
            }
        }
    }

    console.log("Rendering with sensor_selection: " + util.inspect(pc));
    res.render('pages/sensor_selection', {peoplecounters: pc});
};

app.get('/sensor_selection', [pcf, ff, renderf]);

app.get('*', function(req, res) {
    res.render('pages/404');
});

selected_sensors = [];
app.post('/sensor_selection', function(req, res) {
    console.log("Got data: " + util.inspect(req.body));
    /* Only checked boxes are sent */

    var pc = {};
        /* Initialize everything as deselected */
        for(i=0; i<availablePeoplecounters.length; i++) {
        pc[availablePeoplecounters[i]] = {};
        for(j=0; j<availableFields.length; j++) {
            pc[availablePeoplecounters[i]][availableFields[j]] = 'off';
        }
    }
    req.session.peoplecounters = pc;

    var keys = Object.keys(req.body);
    for(i=0; i<keys.length; i++) {
        //Parts: ["pc", peoplecounter, field]
        var parts = keys[i].split('_');
        if(!(parts[1] in req.session.peoplecounters)) {
            req.session.peoplecounters[parts[1]] = {};
        }
        req.session.peoplecounters[parts[1]][parts[2]] = req.body[keys[i]]; 
    }
    var pc = req.session.peoplecounters;
    console.log("Rendering with sensor_selection: " + util.inspect(pc));
    res.render('pages/sensor_selection', {peoplecounters: pc});
});

app.listen(port, function(){
    console.log("Server started at port " + port);
});