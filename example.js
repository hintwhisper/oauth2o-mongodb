

/**
 * 
 */

var express = require('express')
  , oAuth2o = require('oauth2o')
  , oAuth2oMongo = require('oauth2o-mongodb')

var app = express();

var routes = new oAuth2o(oAuth2oMongo('mongodb://handw:5bttny@ds039257.mongolab.com:39257/auth'));

app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.bodyParser());


app.post('/auth/grant', routes.getGrant);
