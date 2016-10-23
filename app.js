'use strict';

var express = require('express');
var path = require('path');

var _port = 8080;

var app = express();

// Collect the routes
var routes = require('./routes');

// Allow access to file directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes
routes(app);

// Create server
app.listen(_port, function(){
    console.log('Ready on port ' + _port + '...');
});
