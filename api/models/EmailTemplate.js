
/**
 * 
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * 
 */

var emailTemplate = new Schema({
  text: String,
  partials: {},
  title: String,
  filePath: String,
  signature: String,
  buttonText: String
});

module.exports = mongoose.model('EmailTemplate', emailTemplate);