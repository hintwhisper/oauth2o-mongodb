
/**
 * deps
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto');

/**
 * 
 */

var AppSchema = new Schema({
  appId: String,
  secretKey: String,
  type: {
    type: String,
    enum: [ 'internal', 'external' ]
  },
  status: {
    type: String,
    enum: [ 'active', 'inactive' ]
  }
});


/**
 * Instance methods
 */

AppSchema.methods = {

  /**
   *  Decipher and return in plain format
   */
  decipher: function(encryption) {
    
    // TODO : fix the error https://gist.github.com/ktkaushik/cc39446202cdcd41bcde
    var decipher = crypto.createDecipher('aes-256-cbc', this.secretKey);
    return decipher.update(encryption, 'base64', 'utf8') + decipher.final('utf8');

  }

};

/**
 * module returns compiled schema
 */

module.exports = mongoose.model('App', AppSchema);


// var app = new module.exports({

//   appId: 'app-001',
//   secretKey: 'sec001',
//   type: 'internal',
//   status: 'active'

// });

// app.save();

