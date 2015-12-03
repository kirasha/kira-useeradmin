'use strict';

var Role            = require('./role.model.js'),
    CRUDController  = require('../../lib/controllers/CRUDController')(Role);

/*
 * Find all roles
 */
exports.index = CRUDController.list();

/*
 * Creates a new role
 */
exports.create = CRUDController.create();

exports.show = CRUDController.read();

exports.update = CRUDController.update();
