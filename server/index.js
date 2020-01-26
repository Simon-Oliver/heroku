const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
var router = require('express').Router();

// API calls
router.get('/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});
router.post('/world', (req, res) => {
  res.send(`I received your POST request. This is what you sent me: ${req.body.post}`);
});

// An api endpoint that returns a short list of items
router.get('/getList', (req, res) => {
  var list = ['item1', 'item2', 'item3'];
  res.json(list);
  console.log('Sent list of items');
});

module.exports = router;
