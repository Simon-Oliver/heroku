const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Websocket
// Optional. You will see this name in eg. 'ps' or 'top' command
//process.title = 'node-chat'; // Port where we'll run the websocket server
var webSocketsServerPort = 8080; // websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

// list of currently connected clients (users)
var clients = [];

//HTTP server

var server = http.createServer(function(request, response) {
  // Not important for us. We're writing WebSocket server,
  // not HTTP server
});
server.listen(webSocketsServerPort, function() {
  console.log('Websocket Server is listening on port ' + webSocketsServerPort);
});

//WebSocket server
var wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});

const app = express();
const port = process.env.PORT || 8000;

app.use('/api', require('./server/index.js'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

console.log('App is listening on port ' + port);
app.listen(port);

wsServer.on('request', function(request) {
  // accept connection - you should check 'request.origin' to
  // make sure that client is connecting from your website
  // (http://en.wikipedia.org/wiki/Same_origin_policy)
  var connection = request.accept(null, request.origin);
  // we need to know client index to remove them on 'close' event
  let index = clients.push(connection);
  console.log(new Date() + ' Connection accepted.');
  console.log('Connected ---------------------- ', connection.id);

  // user sent some message
  connection.on('message', function(message) {
    console.log('message ws fired');
    if (message.type === 'utf8') {
      const data = JSON.parse(message.utf8Data);
      console.log('ws socket received -----', data);

      const { order, userID, userName } = data;
      //console.log('-------order_____', order);
      const neworder = new Order({
        name: userName,
        orderFrom: userID,
        tableNum: '99',
        orderItems: order,
        notes: '',
        orderIn: Date(),
        orderOut: ''
      });

      neworder.save((err, doc) => {
        if (err) {
          console.log(err);
        }
        console.log('Saved', doc);
        Order.find({})
          .select('-__v -createdAt -updatedAt')
          .then(items => {
            // console.log('ITEMS____________>>>>', items);
            clients.forEach(function(client) {
              client.sendUTF(JSON.stringify({ type: 'order', data: items }));
            });
          });
      });
    }
  });

  // user disconnected
  connection.on('close', function(connection) {
    clients.splice(index - 1, 1);
    console.log(connection.remoteAddress + ' disconnected.'); // remove user from the list of connected clients
  });
});
