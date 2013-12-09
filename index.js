
/**
 * 
 */

var crypto = require('crypto')

/**
 * 
 */

var mongoose = require('mongoose');

/**
 * database connection
 */

module.exports = function(connectionString) {

  var MongooseAdapater = {};

  /**
   * connect to the db
   */

  mongoose.connect(connectionString, { server: { poolSize: 5 } });

  var App = require('./models/app_model')
    , Grant = require('./models/grant_model')
    , Token = require('./models/token_model');

  /**
   * adapter
   */

  /**
   * 
   */

  MongooseAdapater.createGrant = function(req, res, next) {
    App.findOne({ appId: req.body.appId }, function(err, app) {
      if (err) return next(err);
      if (app && app.status === 'active') {
        crypto.randomBytes(48, function(ex, buf) {
          Grant.create({    
            grant: buf.toString('hex'),
            appId: req.body.appId,
            status: 'active'
          }, function(err, grant) {
            if (err) return next(err);
            res.json(grant);
          });
        });
      }
    });
  };

  /**
   * @param appId
   * @param encryptionCode
   * @uri /auth/token
   */

  MongooseAdapater.createToken = function(req, res, next) {
    
  };

  /**
   * @param token - header/querystring
   */

  MongooseAdapater.authorize = function(req, res, next) {
    // grabs the token from the url, if the token 
    // is valid then `next()`
  };

  /**
   * expose the module via `module.exports`
   */

};
