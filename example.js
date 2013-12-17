

/**
 * 
 */

var express = require('express')
  , oAuth2o = require('./oauth2o')
  , oAuth2oMongo = require('./oauth2o-mongodb')
  , http = require('http')
  , crypto = require('crypto');

var app = express();

// var routes = new oAuth2o(oAuth2oMongo('mongodb://handw:5bttny@ds039257.mongolab.com:39257/hw_development'));
var routes = new oAuth2o(oAuth2oMongo('mongodb://localhost/hw_development'));

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

app.post('/auth/grant', routes.createGrant);
app.post('/auth/token', routes.createToken);
app.post('/auth/', routes.authorize);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

