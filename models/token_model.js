
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
  grant: String,
  token: String,
  expiryDate: Date
});

/**
 * module returns compiled schema
 */

module.exports = mongoose.model('Token', tokenSchema);