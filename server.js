/*server.js*/

const http = require('http');
const url = require('url');

const hostname = '0.0.0.0';
const port = 3003;

const sensorQuery = encodeURI('http://127.0.0.1:8086/query?db=loradata;q=SHOW TAG VALUES FROM autogen.peoplecounter WITH KEY = "busstop"');

var availablePeoplecounters = [];
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

const server = http.createServer(function(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  var stopstr = '';
  for(i=0; i<availablePeoplecounters.length; i++) {
      stopstr += availablePeoplecounters[i] + ', ';
  }
  stopstr = stopstr.substring(0, stopstr.length - 2);
  res.end('Haltestellen: ' + stopstr);
});

server.listen(port, hostname, function() {
  console.log('Server running at http://'+ hostname + ':' + port + '/');
});
