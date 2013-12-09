
/**
 * deps
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * 
 */

var tokenSchema = new Schema({
  appId: String,
  authCode: String,
  token: String
});

/**
 * module returns compiled schema
 */

module.exports = mongoose.model('Token', tokenSchema);