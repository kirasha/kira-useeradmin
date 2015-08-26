'use strict';

var mongoose        = require('mongoose'),
    uniqueValiator  = require('mongoose-unique-validator'),
    findOrCreate    = require('mongoose-findorcreate'),
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

PermissionSchema.statics.findOrCreate = function (name, callback) {
  var schema = this;
};

PermissionSchema.plugin(uniqueValiator);
PermissionSchema.plugin(findOrCreate);

module.exports = mongoose.model('Permission', PermissionSchema);
