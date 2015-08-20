
/**
 * 3rd deps
 */

var mongoose = require('mongoose')
  , validate = require('mongoose-validator').validate
  , Schema = mongoose.Schema
  , bcrypt = require('bcrypt')
  , async = require('async')
  , _ = require('lodash')
  , Product = require('../models/Product')
  , Brand = require('../models/Brand');

/**
 * Global Settings schema
 */

var GlobalSettingSchema = new Schema({
  settings: {}
});

module.exports = mongoose.model('GlobalSetting', GlobalSettingSchema);
