
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

          var grantCode = buf.toString('hex');
          Grant.create({    
            grant: grantCode,
            appId: req.body.appId,
            status: 'active'
          }, function(err, grant) {
            if (err) return next(err);
            res.json(grantCode);
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
    
    //If appId exists
    App.findOne({ appId: req.body.appId }, function(err, app) {

      if (err) return next(err);
      if (app && app.status === 'active') {
        
        //get encrypted grant code and decrypt it.
        var encGrant = req.body.encGrant;

        //TODO: Decrypt with app.secretKey
        var decKey;

        Grant.findOne({appId: req.body.appId, grant: decKey}, function(err, grant) {

          if (err) 
          {
            console.log('001: Unauthorize Access. Grant passed doest not exist for App: '+req.body.appId);
            return next(err);
          }
          if (grant && grant.status === 'active') {

            //check if Grant has not expired. Grant.createdTime < now()
            if (grant.expiryDate && grant.expiryDate > new Date()){
              return res.json('003: Grant has expired. Need to request for Grant again.');      
            }

            //If Grant is valid

            crypto.randomBytes(48, function(ex, buf) {

              var tokenString = buf.toString('hex');

              Token.create({
                appId: req.body.appId,
                grant: decKey,
                token: tokenString
              }, function(err, token){

                if (err) return next(err);

                //Push token to Grant
                grant.tokens.push(tokenString);

                res.json(tokenString);

              });

            });
          }
          return res.json('003: Grant has expired. Need to request for Grant again.');
        });



      }
      return res.json('002: App is not active');
  
    });
    //return res.json('001: App does not exist');

  };

  /**
   * @param token - header/querystring
   */

  MongooseAdapater.authorize = function(req, res, next) {
    // grabs the token from the url, if the token 
    // is valid then `next()`

    //Pick token from header and not from body
    var tokenString = req.headers['token'];
    Token.findOne({token: tokenString}, function(err, token){
      
      if (err) return next(err);
      App.findOne({appId: token.appId}, function(err, app){
        if (err) return next(err);
        if (app.status === 'active'){

          Grant.findOne({appId: token.appId, grant: token.grant}, function(err, grant) {
            if (err) return next(err);
            if (grant && grant.status === 'active') {
              
              //check if Grant is not expired
              if (grant.expiryDate && grant.expiryDate > new Date()){
                return res.json('003: Grant has expired. Need to request for Grant again.');      
              }

              //If grant is valid
              if (token.status === 'active')
              {
                //Check if token has not expired token.
                if (token.expiryDate && token.expiryDate > new Date()){
                  return res.json('004: Token has expired. Need to request for Token again.');      
                }

                //if token is valid, forward/handle the request
                next();
              }

            }
            return res.json('003: Grant has expired. Need to request for Grant again.');
          });


        }
        return res.json('002: App is not active');
      });



    });



  };

  /**
   * expose the module via `module.exports`
   */

};
