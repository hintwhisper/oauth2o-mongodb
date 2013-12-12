

/**
 * 
 */

var express = require('express')
  , oAuth2o = require('./oauth2o')
  , oAuth2oMongo = require('./oauth2o-mongodb')
  , http = require('http');

var app = express();
console.log('starting');
// console.log(oAuth2oMongo('mongodb://handw:5bttny@ds039257.mongolab.com:39257/hw_development'));
var routes = new oAuth2o(oAuth2oMongo('mongodb://handw:5bttny@ds039257.mongolab.com:39257/hw_development'));

console.log('logging oAuth2o .............');
console.log(oAuth2o);
console.log('logging routes .............');
console.log(routes);
console.log('logging routes.createGrant .............');
// console.log(routes.createGrant());

// app.use(express.logger('dev'));
// app.use(express.methodOverride());
// app.use(express.bodyParser());
// app.use(app.router);

// all environments
app.set('port', process.env.PORT || 3000);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));



app.post('/auth/grant', routes.createGrant);
app.post('/auth/token', routes.createToken);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

