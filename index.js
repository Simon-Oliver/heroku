const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const uuid = require('uuid');
const WebSocket = require('ws').Server;
//const WebSocket = require('websocket').server;

const port = process.env.PORT || 8000;

// Websocket
// Optional. You will see this name in eg. 'ps' or 'top' command
//process.title = 'node-chat'; // Port where we'll run the websocket server
//var webSocketsServerPort = 8080; // websocket and http servers
// var webSocketServer = require('websocket').server;
// var http = require('http');

//Temp. geo locations
let tempLoc = [];

// list of currently connected clients (users)
var clients = [];

//HTTP server

// var server = http.createServer(function(request, response) {
//   // Not important for us. We're writing WebSocket server,
//   // not HTTP server

// });

// server.listen(webSocketsServerPort, function() {
//   console.log('Websocket Server is listening on port ' + webSocketsServerPort);
// });

// const app = express();
// const port = process.env.PORT || 8000;

// console.log('App is listening on port ' + port);
// app.listen(port);

const app = express();

//WebSocket server
// var wsServer = new webSocketServer({
//   // WebSocket server is tied to a HTTP server. WebSocket
//   // request is just an enhanced HTTP request. For more info
//   // http://tools.ietf.org/html/rfc6455#page-6
//   httpServer: app
// });

app.use('/api', require('./server/index.js'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const server = app.listen(port, () => console.log('Listening on', port));
const wss = new WebSocket({
  server: server
});

wss.on('connection', function(ws) {
  // accept connection - you should check 'ws.origin' to
  // make sure that client is connecting from your website
  // (http://en.wikipedia.org/wiki/Same_origin_policy)

  //var connection = ws.accept(null, ws.origin);
  console.log(ws);
  // let connection = ws;
  // we need to know client index to remove them on 'close' event
  ws.id = uuid.v4();
  let index = clients.push(ws); //let index = clients.push(connection);
  console.log(new Date() + ' Connection accepted.');
  console.log('Connected ---------------------- ', ws.id);
  console.log(tempLoc);

  // user sent some message
  ws.on('message', function(message) {
    let data = JSON.parse(message);
    data.id = ws.id;
    let finalData = tempLoc.filter(e => e.id !== ws.id);
    tempLoc = [...finalData, data];

    console.log('temploc -----', tempLoc);
    wss.clients.forEach(function each(client) {
      client.send(JSON.stringify(tempLoc));
    });
  });

  // user disconnected
  ws.on('close', function(connection) {
    console.log(ws.id + ' disconnected.'); // remove user from the list of connected clients
  });
});
