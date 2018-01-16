
/**
 * 
 */

var CryptoJS = require('crypto-js');
 var Crypto = require('crypto');

/**
 * 
 */
var crypto = {

  encrypt : function (text, password) {
    try {
      return CryptoJS.AES.encrypt(text, password).toString();
    } catch (err) { return ''; }
  },

  decrypt : function (text, password) {
    try {
      var decrypted = CryptoJS.AES.decrypt(text, password);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (err) { return ''; }
  }
}
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}
var mongoose = require('mongoose');

/**
 * database connection
 */
console.log('console to to check to pickup latest code 1111')
module.exports = function(connectionString, validHours) {

  var MongooseAdapater = {
    validHours: validHours
  };

  /**
   * connect to the db
   */

   mongoose.connect(connectionString, {
    useMongoClient: true
  });
  var db = mongoose.connection;
  
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  // mongoose.createConnection(connectionString, { server: { poolSize: 5 } });

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
    // console.log('--------------------');
    //console.log(req.body.appId)
    App.findOne({ appId: req.body.appId }, function(err, app) {
      if (err) return next(err);

      if (app && app.status === 'active') {

        var buf = Crypto.randomBytes(48);

        if (err) return next(err);

        var grantCode = buf.toString('hex');

        //REMOVE - Test Encrypted Code
        // var cipher = createCipher('aes-256-cbc', app.secretKey);
        // var encrypted = crypto.encrypt(update(grantCode, 'utf8', 'base64') + cipher.final('base64');
        // console.log('encrypted - '+ encrypted);
        var encrypted = crypto.encrypt(grantCode,app.secretKey);
        Grant.create({
          grant: grantCode,
          appId: req.body.appId,
          status: 'active'
        }, function(err, grant) {
          if (err) return next(err);
          if (app.appId === 'app-002') res.json({GRANT:grantCode})
          else {
            res.json(grantCode);    
          }       

        });
      }else {
        res.json({code:'002',message:' App does not exist or is not active'});
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
          encryptedGrant = replaceAll(' ','+',encryptedGrant);
          var decKey = crypto.decrypt(encryptedGrant,app.secretKey);
        
          Grant.findOne({appId: appId, grant: decKey}, function(err, grant) {

            if (err) {
              // console.log('001: Unauthorize Access. Grant passed doest not exist for App: ' + req.body.appId);
              return next(err);
            };

            if(grant){
              if (grant.status === 'active') {

                //check if Grant has not expired. Grant.createdTime < now()
                checkForExpiry( grant, res, next );

                var buf = Crypto.randomBytes(48);
                var tokenString = buf.toString('hex');

                var expiryDate = new Date();
                expiryDate.setDate( expiryDate.getDate() + _this.validHours );

                Token.create({
                  appId: req.body.appId,
                  grant: decKey,
                  token: tokenString,
                  status: 'active',
                  expiryDate: expiryDate
                }, function(err, token){

                  if (err) return next(err);

                  //Push token to Grant
                  grant.update( {$push: { tokens: tokenString }}, function (err) {
                    if(err) return next(err);
                    if (app.appId === 'app-002') res.json({TOKEN:tokenString});
                    else {
                      res.json(tokenString);
                    }
                    

                  });

                });

              } else{
                res.json({code:'0031',message:'Grant has expired. Need to request for Grant again.'});
              };
            }else {
              res.json({code: '006',message:'Grant does not exist'});
            };
           
          });


        }else {
          res.json({code: '002', message: 'App is not active'});
        };
      }else {
        res.json({code:'001', message:'App does not exist'});
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
                    checkForExpiry( grant,'Grant', res, next );

                    if (token.status === 'active') {
                      //Check if token has not expired token.
                      checkForExpiry( token, 'Token',res, next );

                      next();

                    }else {

                      res.status(401).json({code:'004',messsage:'Token is inactive'});
                    };

                  }  else{
                    res.status(401).json({code:'0031',messsage:'Grant has expired. Need to request for Grant again.'});
                   };

                } else{

                  res.status(401).json({code:'004',messsage:'Grant does not exist for the token.'});
                };
              });

            }else {
              return res.status(401).json({code: '002', messsage:'App is not active'});
            };

          }else {
            res.status(401).json({code:'001',message:'App for the token does not exist'});
          };

        });

      } else{

        res.status(401).json({code: '004', messsage:'Token does not exist'});
      };


    });



  };


  /**
   * Check if the instance(grant or token) has expired or not and
   * update the status to inactive if so
   * PS: This method could also go in respective models, but DRY
   */
  function checkForExpiry (instance, instanceName, res, next) {

    if (instance.expiryDate && instance.expiryDate < new Date()) {
      var messsage = {code:'0031' ,message:'Grant has expired. Need to request for Grant again.'};
      if (instanceName === 'Token') {
        messsage = {code:'0032', message:'Token has expired. Need to request for Grant again.'};
      }
      instance.update({status: 'inactive'}, function (err) {
        if(err) return next(err);
        return res.status(401).json(messsage);
      });
      return res.status(401).json(messsage);
    };

  };

  /**
   * expose the module via `module.exports`
   */
  return MongooseAdapater;

};
