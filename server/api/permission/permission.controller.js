'use strict';

var Permission      = require('./permission.model'),
    CRUDController  = require('../../lib/controllers/CRUDController')(Permission),
    restUtils       = require('../../lib/restUtils.js'),
    formatter       = require('../../lib/restFormatter');

/*
 */

exports.index = CRUDController.list();
/*
 * Create a new Permission
 */

exports.create = CRUDController.create();

exports.show = CRUDController.read();

exports.update = CRUDController.update();
