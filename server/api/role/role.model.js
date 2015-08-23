'use strict';

var mongoose        = require('mongoose'),
    uniqueValiator  = require('mongoose-unique-validator'),
    Schema          = mongoose.Schema;

var RoleSchema  = new Schema({
  name: {
    type: String,
    unique: true,
    required: 'Role name is required'
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

RoleSchema.plugin(uniqueValiator);

module.exports = mongoose.model('RoleSchema', RoleSchema);
