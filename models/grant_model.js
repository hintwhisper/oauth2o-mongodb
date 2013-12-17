
/**
 * deps
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * 
 */

var GrantSchema = new Schema({
  appId: String,
  grant: String,
  status: {
    type: String,
    enum: [ 'active', 'inactive', 'expired' ]
  },
  tokens: [ String ],
  expiryDate: Date
});


/**
 * module returns compiled schema
 */

module.exports = mongoose.model('Grant', GrantSchema);