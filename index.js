
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

module.exports = function(connectionString, validHours) {

  var MongooseAdapater = {
    validHours: validHours
  };

  /**
   * connect to the db
   */
  mongoose.createConnection(connectionString, { server: { poolSize: 5 } });

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

        var buf = crypto.randomBytes(48);

        if (err) return next(err);

        var grantCode = buf.toString('hex');

        //REMOVE - Test Encrypted Code
        var cipher = crypto.createCipher('aes-256-cbc', app.secretKey);
        var encrypted = cipher.update(grantCode, 'utf8', 'base64') + cipher.final('base64');
        console.log('encrypted - '+ encrypted);

        Grant.create({
          grant: grantCode,
          appId: req.body.appId,
          status: 'active'
        }, function(err, grant) {
          if (err) return next(err);

          res.json(grantCode);
        });

      }else {
        res.json('002: App does not exist or is not active');
      };
    });
  };

  /**
   * @param appId
   * @param encryptionCode
   * @uri /auth/token
   */

  MongooseAdapater.createToken = function(req, res, next) {
    var appId = req.body.appId
      , _this = this;

    //If appId exists
    App.findOne({ appId: appId }, function(err, app) {
      if (err) return next(err);
      if(app){
        if(app.status === 'active') {

          var encryptedGrant = req.body.encryptedGrant;
          var decKey = app.decipher(encryptedGrant);

          Grant.findOne({appId: appId, grant: decKey}, function(err, grant) {

            if (err) {
              console.log('001: Unauthorize Access. Grant passed doest not exist for App: ' + req.body.appId);
              return next(err);
            };

            if(grant){
              if (grant.status === 'active') {

                //check if Grant has not expired. Grant.createdTime < now()
                checkForExpiry( grant, res, next );

                var buf = crypto.randomBytes(48);
                var tokenString = buf.toString('hex');

                var expiryDate = new Date();
                expiryDate.setDate( expiryDate.getDate() + _this.validHours );

                Token.create({
                  appId: req.body.appId,
                  grant: decKey,
                  token: tokenString,
                  status: 'active'
                }, function(err, token){

                  if (err) return next(err);

                  //Push token to Grant
                  grant.update( {$push: { tokens: tokenString }}, function (err) {
                    if(err) return next(err);
                    res.json(tokenString);
                  });

                });

              } else{
                res.json('003: Grant has expired. Need to request for Grant again.');
              };
            }else {
              res.json('003: Grant does not exist');
            };
           
          });


        }else {
          res.json('002: App is not active');
        };
      }else {
        res.json('001: App does not exist');
      };
  
    });
  };

  /**
   * @param token - header/querystring
   */

  MongooseAdapater.authorize = function(req, res, next) {
    // grabs the token from the url, if the token 
    // is valid then `next()`

    //Pick token from header and not from body
    var tokenString = req.headers['authorization'];
    console.log("Authorization Header: "+tokenString);

    Token.findOne({token: tokenString}, function(err, token){
      
      if (err) return next(err);
      if (token) {
        App.findOne({appId: token.appId}, function(err, app){
          if (err) return next(err);
          if (app) {
            if (app.status === 'active'){

              Grant.findOne({appId: token.appId, grant: token.grant}, function(err, grant) {
                if (err) return next(err);
                if (grant) {
                  if (grant.status === 'active') {

                    //check if Grant is not expired
                    checkForExpiry( grant, res, next );

                    if (token.status === 'active') {
                      //Check if token has not expired token.
                      checkForExpiry( token, res, next );

                      next();

                    }else {

                      res.json('004: Token is inactive');
                    };

                  };

                } else{

                  res.json('004: Grant does not exist for the token.');
                };
              });

            }else {
              return res.json('002: App is not active');
            };

          }else {
            res.json('001: App for the token does not exist');
          };

        });

      } else{

        res.json('004: Token does not exist');
      };


    });



  };


  /**
   * Check if the instance(grant or token) has expired or not and
   * update the status to inactive if so
   * PS: This method could also go in respective models, but DRY
   */
  function checkForExpiry (instance, res, next) {

    if (instance.expiryDate && instance.expiryDate < new Date()) {
      instance.update({status: 'inactive'}, function (err) {
        if(err) return next(err);
        return res.json('003: Grant has expired. Need to request for Grant again.');
      });
      return res.json('003: Grant has expired. Need to request for Grant again.');
    };

  };

  /**
   * expose the module via `module.exports`
   */
  return MongooseAdapater;

};