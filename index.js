
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
        // 34TRwWOUPdpcSWPC5e83pWYbdy7ZjK7X5IDEMJRPaVQMJgeLSGc1B8qVwAHyCRQhbvbhL7xfjk6A4MiLCIpthNrgs/SCAUAiptVkpl09KnCkrqkb3AlzLDIQQR3g17JsbT86NXdclCdWwUitOCTLhg==
        // var cipher = crypto.createCipher('aes-256-cbc', 'b53e738e6b585c8efee05f87a450d4fd0b5e2ca0d322b83bf49240c3cb71e525887a337f89f1c90165ac7be42c4273be');
        var encrypted = cipher.update(grantCode, 'utf8', 'base64') + cipher.final('base64');
        console.log('encrypted - '+encrypted);

        var expiryDate = new Date();
        expiryDate.setDate( expiryDate.getDate() + 7 ); // one week expiry

        Grant.create({
          grant: grantCode,
          appId: req.body.appId,
          status: 'active',
          expiryDate: expiryDate
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
    var appId = req.body.appId;

    //If appId exists
    App.findOne({ appId: appId }, function(err, app) {
      if (err) return next(err);
      if(app){
        if(app.status === 'active') {

          //get encrypted grant code and decrypt it.
          var encGrant = req.body.encGrant;

          //TODO: Decrypt encGrant with app.secretKey
          var decKey = app.decipher(encGrant);

          Grant.findOne({appId: appId, grant: decKey}, function(err, grant) {
            if (err) {
              console.log('001: Unauthorize Access. Grant passed doest not exist for App: ' + req.body.appId);
              return next(err);
            };
            if(grant){
              if (grant.status === 'active') {

                //check if Grant has not expired. Grant.createdTime < now()
                checkForExpiry( grant, res, next );

                //If Grant is valid

                // crypto.randomBytes(48, function(ex, buf) {
                var buf = crypto.randomBytes(48);

                var tokenString = buf.toString('hex');

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
      if (token) {
        App.findOne({appId: token.appId}, function(err, app){
          if (err) return next(err);
          if (app) {
            if (app.status === 'active'){

              Grant.findOne({appId: token.appId, grant: token.grant}, function(err, grant) {
                if (err) return next(err);
                console.log('......................');
                console.log('......................');
                console.log('......................');
                console.log(grant);
                if (grant) {
                  if (grant.status === 'active') {

                    //check if Grant is not expired
                    checkForExpiry( grant, res, next );

                    //If grant is valid
                    if (token.status === 'active') {
                      //Check if token has not expired token.
                      checkForExpiry( token, res, next );

                      //if token is valid, forward/handle the request
                      next();

                    }else {

                      res.json('004: Token is inactive');
                    };

                  };

                } else{

                  res.json('004: Grant does not exist for the token.');
                };
                // return res.json('003: Grant has expired. Need to request for Grant again.');
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