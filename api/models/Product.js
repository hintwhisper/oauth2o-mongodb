
/**
 * 
 */

var _ = require('lodash')
  , async = require('async')
  , mongoose = require('mongoose')
  , validate = require('mongoose-validator').validate
  , Schema = mongoose.Schema
  , Category = require('../models/Category')
  , Brand = require('../models/Brand')
  , Retailer = require('../models/Retailer')
  , Product = require('../models/Product')
  , User = require('../models/User');

/**
 * Product Schema
 */

var productSchema = new Schema({
  title: {
    type: String
  },
  sku: {
    type: String,
    uniq: true,
    required: true
  },
  slug: {
    type: String
  },
  status: {
    type: String
  },
  type: {
    type: String
  },
  description: String,
  seo: {
    title: String,
    h1tag: String,
    seoUrl: String,
    pageDesc: String,
    keywords: [String],
    metaDescription: String
  },
  tags: [String],
  images: [ String ],
  // images: [{
  //   imagePath: String,
  //   imageName: String,
  // }],
  
  priority: Number,
  slug: String,
  pricing: {
    wholesale: Number,
    retail: Number,
    savings: Number,
    list: Number,
    startRange: Number,
    endRange: Number
  },
  inventory: {
    quantity: Number,
    stockStatus: {
      type: String,
      enum: ['IN_STOCK', 'OUT_OF_STOCK']
    }
  },
  productGroup: String,

  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },

  company: {
    optId: Number,
    optName: String
  },

  optId: String,

  opt: {
  	styleName: String,
  	styleNumber: String,
  	referenceNumber: String
  },

  /**
   * e.g. 
   *  {
   *    Style: vintage,
   *    Setting: solitaire,
   *    Shape: heart,
   *    Metal: platinum  
   *  }
   * 
   */
  attributes: {},
  meta: {},
  
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  associatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  matchingProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  //If Product has a parent product. Can be used for variations
  parentProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  reviews: [reviewSchema],
  ratings: [ratingSchema],
  sectors: [{
    type: String,
    enum: ['bridal', 'watches', 'jewelry']
  }],

  // product level settings
  settings: {},

  //Rating counts
  loveCount: {type: Number, default: 0},
  likeCount: {type: Number, default: 0},
  mustHaveCount: {type: Number, default: 0},

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date

});


var reviewSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // If there are nested replies/reviews to reviews
  // parent: reviewSchema,
  children: [reviewSchema],
  comment: String,
  insertedTimestamp: Date

});

var ratingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  value: {
    type: String,
    enum: ['LIKE', 'LOVE', 'MUST_HAVE']
  },
  insertedTimestamp: Date

});

/**
 * 
 */

productSchema.statics = {

  findAndManageAttributes: function(id, attrs, action, cb) {

    this.findById(id, function(err, product) {
      if (err) return cb(err);
      if (product) {

        product.manageAttributes( attrs, action, function(err, product) {
          if (err) return cb(err);
          if (product) return cb(null, product);
        });

      } else {
        return cb({errors: ['No Product found'], status: 404});
      }
    });

  },

  findAndManageCategories: function(id, categories, action, cb) {

    this.findById(id, function(err, product) {
      if (err) return cb(err);
      if (product) {

        product.manageCategories( categories, action, function(err, product) {
          if (err) return cb(err);
          if (product) return cb(null, product);
        });

      } else {
        return cb({errors: ['No Product found'], status: 404});
      }
    });

  },

  findAndManageAssociatedProducts: function(id, associatedProducts, action, cb) {

    this.findById(id, function(err, product) {
      if (err) return cb(err);
      if (product) {

        product.manageAssociatedProducts( associatedProducts, action,
          function(err, product) {
            if (err) return cb(err);
            if (product) return cb(null, product);
        });

      } else {
        return cb({errors: ['No Product found'], status: 404});
      }
    });

  }

};

/**
 * 
 */

productSchema.methods = {

  uploadWithRule: function(productValues, rules, cb) {

    for(i in rules) {
      var rule = rules[i];
      this[i] = productValues[rule];
    }

    this.save(function(err, product) {
      if (err) return cb(err);
      if (product) return cb(product);
    });

  },

  // add, update and delete attributes
  manageAttributes: function(attrs, action, cb) {

    var _this = this;

    if (!_this.attributes) _this.attributes = {};

    // adding attributes
    for (var i=0, len=attrs.length; i < len; i ++) {
      if (action === 'add' || action === 'update')
        for (j in attrs[i]) _this.attributes[j] = attrs[i][j];
      else 
        delete _this.attributes[attrs[i]];

    }

    var updatedAttributes = _this.attributes;

    _this.update({ $set: { attributes: updatedAttributes } }, function(err, status) {
      if (err) return cb(err);
      if (status) return cb(null, _this);
    });

  },

  /**
   * DRY manageCategories & manageAssociatedProducts
   */

  manageCategories: function(categories, action, cb) {

    var _this = this
      , add = (action === 'add') ? true : false
      , categoriesToBeRemoved = []
      , updatedCategories = _this.categories;

    async.series([
      function(callback) {
          var len = categories.length;

          // recursive function to collect categories' ids in different arrays
          function findAndPushCategory (count) {
            if (count < len) {

              // backup, uniq by converting each id to string first
              var qr = {name: categories[count]};

              Category.findOne(qr, function(err, cg) {
                if (!err && cg) {
                  if (add)
                    updatedCategories.push(cg.id);
                  else
                    categoriesToBeRemoved.push(cg.id);

                  count++;
                  findAndPushCategory(count);
                }
                // create a new category only if action is add
                if (!cg && add) {
                  // create a new category
                  Category.create(qr, function(err, cg) {
                    if (!err && cg) {
                      updatedCategories.push(cg.id);
                      count++;
                      findAndPushCategory(count);
                    }
                  });
                };
              });

            } else {
              callback(null);
            }// if count < len
          } // end of function

          findAndPushCategory(0);
      },
      function (callback) {

        if (add) {

          updatedCategories = _.uniq(updatedCategories, function(id) {
            return id.toString();
          });

        } else {
          for (i=0, len=categoriesToBeRemoved.length; i<len; i++) {

            _.remove(updatedCategories, function(id) {
              return (id.toString()) == categoriesToBeRemoved[i];
            });

          }
        };
        callback(null);
      },
      function(callback) {

        var query = { $set: { categories: updatedCategories } };

        _this.update( query, function(err, status) {
          if (err) return cb(err);
          if (status) return cb(null, _this);
        });

      }
    ]);

  },

  manageAssociatedProducts: function(associatedProducts, action, cb) {

    var _this = this;

    var updatedAssociatedProducts = _this.associatedProducts;

    for (var i=0, len=associatedProducts.length; i < len; i ++) {
      updatedAssociatedProducts.push(associatedProducts[i].id);

      if (action === 'add') {

        // backup, uniq by converting each id to string first
        updatedAssociatedProducts = _.uniq(updatedAssociatedProducts, function(id) {
          return id.toString();
        });


      } else {

        // backup, remove by converting each id to string first
        _.remove(updatedAssociatedProducts, function(id) {
          return (id.toString()) == associatedProducts[i].id;
        });

      }
    }

    var query = { $set: { associatedProducts: updatedAssociatedProducts } };

    _this.update( query, function(err, status) {
      if (err) return cb(err);
      if (status) return cb(null, _this);
    });

  }

};
/**
* 
*/

//PRODUCTGROUP data structures added as virtuals
/**
 * propertyTypeAllValuesMap virtual getter
 */

productSchema.virtual('propertyTypeAllValuesMap').get(function() {
  return this._propertyTypeAllValuesMap;
});

/**
 * propertyTypeAllValuesMap virtual setter
 */

productSchema.virtual('propertyTypeAllValuesMap').set(function(propertyTypeAllValuesMap) {
  this._propertyTypeAllValuesMap = propertyTypeAllValuesMap;
  
});

/**
 * propertyValueProductsMap virtual getter
 */

productSchema.virtual('propertyValueProductsMap').get(function() {
  return this._propertyValueProductsMap;
});

/**
 * propertyValueProductsMap virtual setter
 */

productSchema.virtual('propertyValueProductsMap').set(function(propertyValueProductsMap) {
  this._propertyValueProductsMap = propertyValueProductsMap;
  
});

/**
 * propertyFilterMap virtual getter
 */

productSchema.virtual('propertyFilterMap').get(function() {
  return this._propertyFilterMap;
});

/**
 * propertyFilterMap virtual setter
 */

productSchema.virtual('propertyFilterMap').set(function(propertyFilterMap) {
  this._propertyFilterMap = propertyFilterMap;
  
});

/**
 * productGroupIdProductMap virtual getter
 */

productSchema.virtual('productGroupIdProductMap').get(function() {
  return this._productGroupIdProductMap;
});

/**
 * productGroupIdProductMap virtual setter
 */

productSchema.virtual('productGroupIdProductMap').set(function(productGroupIdProductMap) {
  this._productGroupIdProductMap = productGroupIdProductMap;
});





productSchema.set('toJSON', { getters: true, virtuals: true });
productSchema.set('toObject', { getters: true, virtuals: true });
module.exports = mongoose.model('Product', productSchema);