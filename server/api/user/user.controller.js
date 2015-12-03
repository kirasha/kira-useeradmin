'use strict';

var User            = require('./user.model'),
    CRUDController  = require('../../lib/controllers/CRUDController')(User);

exports.index = CRUDController.list();

/*
 * Create a new user
 */
exports.create = CRUDController.create();

exports.show = CRUDController.read();

exports.update = CRUDController.update();
