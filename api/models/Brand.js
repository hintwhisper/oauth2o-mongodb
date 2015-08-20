
/**
 *
 */

var _ = require('lodash')
  , async = require('async')
  , mongoose = require('mongoose')
  , validate = require('mongoose-validator').validate
  , Schema = mongoose.Schema
  , Retailer = require('../models/Retailer')
  , Category = require('../models/Category');

/**
 * Brand Schema
 */

var brandSchema = new Schema({
  optId: String,
  name: {
    type: String,
    unique: true
  },
  //logo: String,

  //logo_#company_id_1.png - product page and modal
  //logo_#company_id_2.png - product list and hintlist
  //logo_#company_id_3.png - emails
  logo: [String],
  images: [String],
  wpId: String, // wordpress Id
  photos: [ String ],
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zipcode: String
  },
  geolocation: {
    type: [ Number ],
    index: '2d'
  },
  phone: String,
  email: String,
  promoCopy: String,
  hours: String,
  website: String,
  slug: {
    type: String,
    unique: true
  },
  social: {
    facebook: {
      id: Number,
      url: String
    },
    twitter: {
      id: String,
      url: String
    }
  },
  hasMakeAppointment: Boolean,
  hasAskBrand: Boolean,
  plan: String, // level of participation
  retailers: [{
  	type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer'
  }],
  categories: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category'
	}],
	visibility: [{
    type: String,
    enum: ['LEFT', 'TOP']
  }],
  description: String,
  productBackgroundImage: String,
  productBackgroundColor: String,
  sectors: [{
    type: String,
    enum: ['bridal', 'watches', 'jewelry']
  }],
  textColor: String,
  iconTheme: {
    type: String,
    enum: ['', 'dark', 'light', 'custom']
  },
  customIcon: String,

  // brand level settings
  settings: {}

});

/**
 * 
 */

brandSchema.statics = {

  findAndManageCategories: function(id, categories, action, cb) {

    this.findById(id, function(err, brand) {
      if (err) return cb(err);
      if (brand) {

        brand.manageCategories( categories, action, function(err, brand) {
          if (err) return cb(err);
          if (brand) return cb(null, brand);
        });

      } else {
        return cb({errors: ['No Brand found'], status: 404});
      }
    });

  },

  findAndManageRetailers: function(id, categories, action, cb) {

    this.findById(id, function(err, brand) {
      if (err) return cb(err);
      if (brand) {

        brand.manageCategories( categories, action, function(err, brand) {
          if (err) return cb(err);
          if (brand) return cb(null, brand);
        });

      } else {
        return cb({errors: ['No Brand found'], status: 404});
      }
    });

  },
};

brandSchema.methods = {

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

  manageRetailers: function(categories, action, cb) {

    var _this = this;

    var updatedRetailers = _this.retailers;

    for (var i=0, len=retailers.length; i < len; i ++) {
      updatedRetailers.push(retailers[i]);

      if (action === 'add') {

        // backup, uniq by converting each id to string first
        updatedRetailers = _.uniq(updatedRetailers, function(id) {
          return id.toString();
        });


      } else {

        // backup, remove by converting each id to string first
        _.remove(updatedRetailers, function(id) {
          return (id.toString()) == retailers[i];
        });

      }
    }

    var query = { $set: { retailers: updatedRetailers } };

    _this.update( query, function(err, status) {
      if (err) return cb(err);
      if (status) return cb(null, _this);
    });

  }
};

module.exports = mongoose.model('Brand', brandSchema);