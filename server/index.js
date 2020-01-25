const express = require('express');
const bodyParser = require('body-parser');
var router = require('express').Router();
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

// API calls
router.get('/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});
router.post('/world', (req, res) => {
  res.send(`I received your POST request. This is what you sent me: ${req.body.post}`);
});

module.exports = router;
