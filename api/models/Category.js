
/**
 *
 */

var mongoose = require('mongoose')
  , validate = require('mongoose-validator').validate
  , Schema = mongoose.Schema
  , Category = require('../models/Category')
  , Brand = require('../models/Brand')
  , Retailer = require('../models/Retailer');


/**
 * Category Schema
 */

var categorySchema = new Schema({
  name: {
    type: String,
    required: true
  },

  images: [String],

  // If Product has a parent product. Can be used for variations
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  brands: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  }],
  retailers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer'
  }],
  description: String,
  slug: String,
  visibility: [{
    type: String,
    enum: ['LEFT', 'TOP']
  }],
  sectors: [{
    type: String,
    enum: ['bridal', 'watches', 'jewelry']
  }]
});

module.exports = mongoose.model('Category', categorySchema);