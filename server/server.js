'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app       = require('./app');

process
.on('SIGINT', app.stopServer)
.on('SIGTERM', app.stopServer);

app.startServer();
