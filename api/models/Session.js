
/**
 * 
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * 
 */

var sessionSchema = new Schema({});

module.exports = mongoose.model('Sesssion', sessionSchema);