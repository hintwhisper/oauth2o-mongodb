
/**
 *
 */

var express = require('express')
  , MongoStore = require('connect-mongo')(express)
  , http = require('http')
  , mongoose = require('mongoose')
  , OAutho = require('oauth2o')
  , OAuth2Mongo = require('oauth2o-mongodb');

var uploadCron = require('./api/uploadcron');

/**
 * Load the main config and create the app server.
 */

var config = require('config')
  , server = express();

server.configure('production', function() {
  server.config = require('./config/production');
});

server.configure('staging', function() {
  server.config = require('./config/staging');
});

server.configure('qa', function() {
  server.config = require('./config/qa');
});

server.configure('development', function() {
  server.config = require('./config/development');

});
server.configure('default', function() {
  server.config = require('./config/default');

});
server.use(express.bodyParser({limit: '50mb'}));
server.use(express.methodOverride());
server.use(express.cookieParser('ali7n4c5yowlienv8tow586wo8n74v5o'));
server.use(express.session({
  secret: 'ali7n4c5yowlienv8tow586wo8n74v5o',
  store: new MongoStore({
    url: config.mongodb.uri
  })
}));

server.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});
////api Security
server.oauth2o = new OAutho( OAuth2Mongo(server.config.mongodb.uri, 48) );

// server.use(server.logger);

/**
 *
 */

console.log("Database connected to "+server.config.mongodb.uri);
 mongoose.connect(server.config.mongodb.uri, { server: { poolSize: 5 } });

// // server.post('/csvupload', function (req, res, next) {
//   console.log("received data on standalone. Now processing..");
//   var filePath = req.body.filePath
//     , fileName = req.body.fileName
//     , brandId = req.body.brandId
//     , brandName = req.body.brandName;

//   server.monq.upload({
//     filePath: filePath,
//     fileName: fileName,
//     brandId: brandId,
//     brandName: brandName
//   }, function(err) {
//     if (err) console.error(err);
//     //return res.json();
//   });

//   return res.json({});
// });

var uploadJobs = require('./api/workers/upload')(server)
uploadCron(server);
server.post('/csvupload',server.oauth2o.authorize, uploadJobs.csvUpload)

server.get('/test', function (req, res, next) {
  return res.json('It works just fine !');
});

http.createServer(server).listen(server.config.standalone.port, function(){
  var spawn = require('child_process').spawn
  spawn('open', [server.config.server.host]);

  console.log("Upload server listening on port "+server.config.standalone.port);
});

