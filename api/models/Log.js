
/**
 * 
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * 
 */

var logSchema = new Schema({});

module.exports = mongoose.model('Log', logSchema);