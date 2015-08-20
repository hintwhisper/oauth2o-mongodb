
/**
 * 
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var zipcodeSchema = new Schema({
  zipcode: { type: String, index: true },
  type: String,
  city: String,
  state: String,
  lat: Number,
  lon: Number,
  location: String
});

module.exports = mongoose.model('Zipcode', zipcodeSchema);