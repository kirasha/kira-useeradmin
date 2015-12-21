'use strict';

var mongoose        = require('mongoose'),
    crypto          = require('crypto'),
    filter          = require('mongoose-filter'),
    timeStamps      = require('mongoose-timestamp'),
    mongooseHidden  = require('mongoose-hidden')(),
    Role            = require('../role/role.model'),
    Schema          =  mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    match: [/.+\@.+\..+/, 'Please fill a valid e-mail address'],
    required: 'A password is required'
  },
  username: {
    type: String,
    unique: true,
    required: 'User name is required',
    trim: true
  },
  password: {
    type: String,
    required: 'Password is required',
    validate: [
      function (password) {
        return password && password.length >= 6;
      },
      'Password has to be at least 6 characters'
    ]
  },
  salt: {
    type: String
  },
  provider: {
    type: String
  },
  providerId: String,
  providerData: {},
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  created: {
    type: Date,
    default: Date.now
  },
  userProperties: {}
});

// virtual properties
UserSchema.virtual('fullName')
  .get(function () {
    return this.firstName + ' ' + this.lastName;
  })
  .set(function (fullName) {
    var splitName = fullName.split(' ');
    this.firstName = splitName[0] || '';
    this.lastName = splitName[1] || '';
  });

UserSchema.pre('save', function (next) {
  if (this.password) {
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'),'base64');
    this.password = this.hashPassword(this.password);
  }

  // assign default role if no role was provided
  var user = this;
  if (!user.role) {
    Role.getDefaultRole(function (err, role) {
      if (!err && role) {
        user.role = role._id;
      }
      next();
    });
  } else {
    next();
  }

});

// methods
UserSchema.methods.hashPassword = function (password) {
  return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

// static methods
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
  var _this = this;
  var possibleUsername = username + (suffix || '');

  _this.findOne({
    username: possibleUsername
  }, function (err, user) {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
      }
    } else {
      callback(null);
    }
  });
};

UserSchema.set('toJSON', {
  getters: true,
  virtuals: true
});

UserSchema.plugin(filter);
UserSchema.plugin(timeStamps);
UserSchema.plugin(mongooseHidden);

module.exports = mongoose.model('User', UserSchema);
