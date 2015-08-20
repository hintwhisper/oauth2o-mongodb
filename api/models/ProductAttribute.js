
/**
 * This collection would store all the attributes in general.
 * To be specific, these attrs will be used to search and filter the products
 * as the user wants.
 * The attributes on teh UI would appear on left and/or top
 */

var mongoose = require('mongoose'),
  validate = require('mongoose-validator').validate,
  Schema = mongoose.Schema,
  Category = require('../models/Category'),
  Brand = require('../models/Brand'),
  Retailer = require('../models/Retailer'),
  ProductAttribute = require('../models/ProductAttribute'),
  _ = require('lodash');

/**
 * ProductAttribute Schema
 */

var productAttributeSchema = new Schema({

  //name of Attributes, e.g. Style, Shape, Metal
  name: {
    type: String,
    required: true
  },

  images: [String],
  
  // Attribute Values,
  // e.g: ['Classic', 'Vintage', 'Genstone', 'Sidestone', 'Halo'] 
  // for Style Attributes
  values: [String],

  description: String,

  slug: String,

  visibility: [{
    type: String,
    enum: ['LEFT', 'TOP']
  }],

  // If ProductAttribute has a parent productAttribute.
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductAttribute'
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductAttribute'
  }],
  brands: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  }],
  retailers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer'
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  sectors: [{
    type: String,
    enum: ['bridal', 'watches', 'jewelry']
  }]
});


productAttributeSchema.methods = {
  setParentToChildren: function(cb) {
    _.each(this.children, function(pAttribute, key) {
      pAttribute.parent = this._id;
      pAttribute.save(function(err) {
        if (err) return cb(err);
      });
    }, this);
  }
};

module.exports = mongoose.model('ProductAttribute', productAttributeSchema);
