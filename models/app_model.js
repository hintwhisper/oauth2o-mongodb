
/**
 * deps
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * 
 */

var appSchema = new Schema({
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
 * module returns compiled schema
 */

module.exports = mongoose.model('App', appSchema);


// var app = new module.exports({

//   appId: 'app-001',
//   secretKey: 'sec001',
//   type: 'internal',
//   status: 'active'

// });

// app.save();

