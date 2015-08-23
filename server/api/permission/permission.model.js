'use strict';

var mongoose        = require('mongoose'),
    uniqueValiator  = require('mongoose-unique-validator'),
    Schema          = mongoose.Schema;

var PermissionSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: 'Permission name is required'
  },
  description: String,
  builtIn: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
});

PermissionSchema.plugin(uniqueValiator);

module.exports = mongoose.model('Permission', PermissionSchema);
