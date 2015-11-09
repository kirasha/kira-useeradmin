'use strict';

var mongoose        = require('mongoose'),
    uniqueValiator  = require('mongoose-unique-validator'),
    findOrCreate    = require('mongoose-findorcreate'),
    filter          = require('mongoose-filter'),
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
PermissionSchema.plugin(findOrCreate);
PermissionSchema.plugin(filter);

PermissionSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.__v;
  }
});

module.exports = mongoose.model('Permission', PermissionSchema);
