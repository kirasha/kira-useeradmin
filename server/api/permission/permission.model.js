'use strict';

var mongoose        = require('mongoose'),
    uniqueValiator  = require('mongoose-unique-validator'),
    findOrCreate    = require('mongoose-findorcreate'),
    timeStamps      = require('mongoose-timestamp'),
    filter          = require('mongoose-filter'),
    mongooseHidden  = require('mongoose-hidden')(),
    config          = require('../../config/environment'),
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

PermissionSchema.virtual('href')
  .get(function () {
    return config.site.api_url + 'permissions/' + this._id;
  });

PermissionSchema.set('toJSON', {
  getters: true,
  virtuals: true
});

PermissionSchema.plugin(uniqueValiator);
PermissionSchema.plugin(findOrCreate);
PermissionSchema.plugin(filter);
PermissionSchema.plugin(timeStamps);
PermissionSchema.plugin(mongooseHidden);

module.exports = mongoose.model('Permission', PermissionSchema);
