
/**
 * 
 */

var crypto = require('crypto')
, bcrypt = require('bcrypt');

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
console.log('.............. inside oauth2o-mongodb.......................');
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
    console.log('mongodb - createGrant - '+req.body.appId);
    App.findOne({ appId: req.body.appId }, function(err, app) {
      if (err) return next(err);
      console.log(app);
      if (app && app.status === 'active') {

        var buf = crypto.randomBytes(48);

        if (err) return next(err);

        var grantCode = buf.toString('hex');

        //REMOVE - Test Encrypted Code
        var cipher = crypto.createCipher('aes-256-cbc', app.secretKey);
        var encrypted = cipher.update(grantCode, 'utf8', 'base64') + cipher.final('base64');
        console.log('encrypted - '+encrypted);

        Grant.create({    
          grant: grantCode,
          appId: req.body.appId,
          status: 'active'
        }, function(err, grant) {
          if (err) return next(err);

          res.json(grantCode);
        });

      }else {

        res.json('002: App is not active');
      };
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

        //TODO: Decrypt encGrant with app.secretKey
        var decKey = app.decipher(encGrant);
        console.log("encGrant = %s", encGrant);
        console.log(decKey);

        Grant.findOne({appId: req.body.appId, grant: decKey}, function(err, grant) {

          if (err) {
            console.log('001: Unauthorize Access. Grant passed doest not exist for App: ' + req.body.appId);
            return next(err);
          }
          if (grant && grant.status === 'active') {

            //check if Grant has not expired. Grant.createdTime < now()
            if (grant.expiryDate && grant.expiryDate > new Date()){
              return res.json('003: Grant has expired. Need to request for Grant again.');      
            }

            //If Grant is valid

            // crypto.randomBytes(48, function(ex, buf) {
            var buf = crypto.randomBytes(48);

            var tokenString = buf.toString('hex');

            Token.create({
              appId: req.body.appId,
              grant: decKey,
              token: tokenString
            }, function(err, token){

              if (err) return next(err);

              //Push token to Grant
              grant.update( {$push: { tokens: tokenString }}, function (err) {
                if(err) return next(err);
              });

              res.json(tokenString);

            });

            // });
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
              if (grant.expiryDate && grant.expiryDate > new Date()) {
                return res.json('003: Grant has expired. Need to request for Grant again.');      
              }

              //If grant is valid
              if (token.status === 'active') {
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
  console.log('........returning MongooseAdapater ...........................');
  return MongooseAdapater;

};
