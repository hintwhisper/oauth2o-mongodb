
/**
 * deps
 */

var _ = require('lodash')
  , mongoose = require('mongoose')
  , validate = require('mongoose-validator').validate
  , Schema = mongoose.Schema
  , Brand = require('../models/Brand')
  , Category = require('../models/Category');



/**
 * Retailer schema
 */

var retailerSchema = new Schema({
  optId: String,
  name: String,
  description: String,
  
  //logo_#company_id_1.png - product page and modal
  //logo_#company_id_2.png - product list and hintlist
  //logo_#company_id_3.png - emails
  logo: [String],
  images: [String],

  photos: [ String ],
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
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
  slug: String,
  social: {
    facebook: {
      id: String, // ?? - kt
      slug: String
    },
    twitter: {
      id: String,
      url: String
    },
    yelp: {
      url: String,
      slug: String
    }
  },
  hasMakeAppointment: Boolean,
  hasAskRetailer: Boolean,
  plan: String, // level of participation
  brands: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  otherRetailers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer'
  }],
  visibility: [{
    type: String,
    enum: [ 'LEFT', 'TOP' ]
  }],
  operationHours: [String],
  description: String,
  productBackgroundImage: String,
  productBackgroundColor: String,
  sectors: [{
    type: String,
    enum: ['bridal', 'watches', 'jewelry']
  }],

  // reviews
  reviews: [{
    headline: String,
    comment: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    createdAt: Date,
    updatedAt: Date
  }],
  
  // would store the count of ratings of the 5, 4, 3, 2,1
  ratingsCount: {}

});

retailerSchema.statics = {

  populateBrandsAndCategories: function(query, cb) {

    this.findOne(query)
      .populate('reviews.user')
      .populate('brands', 'name slug')
      .populate('categories', 'name slug')
      .populate('otherRetailers', 'name slug address')
      .exec(function(err, retailer) {
        if (err) return cb(err);
        if (retailer) {

          /**
           * calculate the average of the ratings
           */
          retailer = retailer.toObject();
          var sortedReviews = _.sortBy(retailer.reviews, 'updatedAt');
          retailer.reviews = sortedReviews.reverse();
          var ratingsObj = retailer.ratingsCount
            , ratings = []
            , sum = 0, len, baseTotal = 0;
          /**
           * from time and time again, there are heavy chances that the rating might pop up as 0
           * in cases as these, we would want to avoid using the rating with 0. As it is, multiplication 
           * with zero is just zero but we use the length of this below array i.e. len to calculate average.
           * - kt
           */

          for (val in ratingsObj) {
            if (ratingsObj[val] > 0) ratings.push(val);
          }

          len = ratings.length;
          console.log("the len is ", len);

          for (var i = len - 1; i >= 0; i--) {
            baseTotal += _.parseInt(ratingsObj[ratings[i]]);
            sum += ((_.parseInt(ratingsObj[ratings[i]])) * (_.parseInt(ratings[i])));
          }
          retailer.averageRating = parseFloat((sum/baseTotal).toFixed(1));
          return cb(null, retailer);
        }
        if (!retailer) return cb({errors: ['No such retailer found'], status: 404});
      });
  }

}

module.exports = mongoose.model('Retailer', retailerSchema);
