'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/useradmin-dev'
  },

  ip: '127.0.0.1',

  populateDB: true,
  site: {
    base_url: 'http://localhost:9000',
    api_url: 'http://localhost:9000/api/'
  }
};
