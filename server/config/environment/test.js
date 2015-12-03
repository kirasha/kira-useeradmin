'use strict';

// Test specific configuration
// ===========================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/useradmin-test'
  },
  populateDB: false,
  port: 7000,
  site: {
    base_url: 'http://localhost:9000/',
    api_url: 'http://localhost:9000/api/'
  }
};
