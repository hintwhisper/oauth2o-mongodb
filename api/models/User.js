
/**
 * native deps
 */

var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , utils = require('../utils')
  , base64Decode = utils.base64decode
  , EmailMonq = require('../utils/email') 
 

/**
 * 3rd deps
 */

var mongoose = require('mongoose')
  , validate = require('mongoose-validator').validate
  , Schema = mongoose.Schema
  , bcrypt = require('bcrypt')
  , async = require('async')
  , _ = require('lodash')


var Brand = require('../models/Brand')
  , Product = require('../models/Product')
  , Category = require('../models/Category');

/**
 * 
 */

var relations = [
  'Single',
  'Engaged',
  'Widowed',
  'Married',
  'Divorced',
  'Separated',
  'In a civil union',
  'In a relationship',
  'Soon to be married',
  'In an open relationship',
  'In a domestic partnership',
  'In a complicated relationship'
];

var sectors = ['bridal', 'watches', 'jewelry'];

/**
 * Bridal profile schema
 */

var BridalSchema = new Schema({
  fingerSize: { type: Number, required: true },
  desiredShape: Array,
  desiredMetalColor: {
    type: Array,
    enum: ['Red, Blue, Green, Yellow']
  },
  desiredStyle: Array,
  additionalNote: String
});

/**
 * User schema
 */

var sendAsTypes = ['self', 'hw', 'someoneElse', 'brand'];

var UserSchema = new Schema({
  name: { first: String, last: String },
  hash: {
    type: String,
    required: true,
    select: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [ validate('len', 6, 64), validate('isEmail') ]
  },

  oneallToken: String,

  signedUpFrom: String,

  gender: {
    type: String,
    enum: ['Male','Female']
  },
  location: String,
  
  zipCode: String,
  geolocation: {
    type: [ Number ],
    index: '2d'
  },

  provider: String,
  birthDate: String, // date is stored in yyyy-mm-dd
  weddingDate: String,
  expectedWeddingDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  description: String,
  confirmedAt: { type: Date },
  fbAuthToken: { type: String },
  signInCount: Number,
  lastSignIn: String,
  currentSignIn: String,
  confirmationToken: { type: String },
  foundTheOne: { type: String },
  engagementTiming: { type: String },
  // relationshipStatus: { type: String, enum: relations },
  relationshipStatus: { type: String }, // Facebook and google store relations with different case. Thus, commenting to avoid complications for now. - kt
  resetPasswordToken: { type: String, default: null },
  resetPasswordSentAt: String,
  confirmationTokenSentAt: { type: String, default: null },
  currentLocation: String,

  // deals only with the profile updates
  profileCreatedAt: Date,
  profileUpdatedAt: Date,

  // profile schema
  profiles: {
    bridal: {
      fingerSize: Number,
      desiredShape: Array,
      desiredSetting: Array,
      desiredMetalColor: {
        type: Array,
        enum: ['Red, Blue, Green, Yellow']
      },
      desiredStyle: Array,
      additionalNote: String
    }
  },

  // privacy settings 
  privacy: {
    publicProfile: { type: Boolean, default: true }, // or we can use privateProfile, suggestions ?
    grantedUsers: [{
      name: {
        first: String,
        last: String
      },
      email: {
        type: String,
        required: true
      },
      relationship: {
        type: String,
        required: true
      },
      // if gatekeeper is false and grantedBy has an email than its someoneElse
      grantedBy: { // has been granted by someone
        type: String,
        default: null
      },
      gatekeeper: { // is a gatekeeper or not
        type: Boolean,
        default: false
      },
      expiry: {
        type: Date,
        default: expiryDate()
      },
      approveByGatekeeper : { //means If approve by gatekeepr means those list can't see by user
        type: Boolean,
        default: false
      }
    }]
  },

  // hintlist settings
  hintlist: {

    love: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      sectors: [],
      personalNote: {
        privateNote: {
          type: Boolean,
          default: false
        },
        text: String
      }
    }],

    like: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      sectors: [],
      personalNote: {
        privateNote: {
          type: Boolean,
          default: false
        },
        text: String
      }
    }],

    mustHave: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      sectors: [],
      personalNote: {
        privateNote: {
          type: Boolean,
          default: false
        },
        text: String
      }
    }]

  },

  // request settings
  requests: [{
    email: String, //email of the requester
    name: Object, //name of the requester
    relationship: String, //relationship to the user
    as: String, // enums of string ['gatekeeper', 'self', 'hw', 'someoneElse']
    granted: {
      type: Boolean,
      default: false
    },
    gatekeeper: {  //email id of gatekeeper
      type: String,
      default: null
    },
    someoneElse: {
      name: Object,
      email: String,
      relationship: String
    },
    createdAt: {
      type: Date,
      default: new Date()
    }
  }],

  /**
   *  All the requests made by user to access profile
   *  These requests will be processed once the user confirms their account
   */
  requestsMade: [{
    to: String, // user's email
    as: String,
    name: {first:String,last:String},
    from: {
      type: String,
      default: null
    },
    relationship: String, // relationship to Alexis
    someoneElse: {
      type: String,
      default: null
    },
    gatekeeper: {  //email id of gatekeeper
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: new Date()
    }
  }],

  pendingRequests: [{
    to: String,
    name: {first:String,last:String},
    from: String,
    as: String,
    relationship: String,
    someoneElse: {
      type: Boolean,
      default: false
    },
    gatekeeper: {
      type: Boolean,
      default: false
    }
  }],

  // pending approvals for both someoneElse and gatekeeper
  // it would always be either of these options or else
  // its self, hw or brand
  pendingApprovals: [{
    to: String, // user's email
    from: String, //requester
    name: Object,
    relationship: String, // relationship to Alexis
    someoneElse: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: new Date()
    }
  }],

  // invites schema
  invites: [{
    sendAs: {
      type: String,
      required: true,
      enum: sendAsTypes
    },
    details: {
      as: String, // could be one of the enums for sendAs
      name: {first:String,last:String}, // name of the brand, name of the someoneELse to be sent as, hw in case of hw, self in case of self 
      email: String // email of the person for someoneElse, email of brand, email of hw, email of self
    },
    inviteeEmail: {
      required: true,
      type: String
    },
    inviterEmail: {type:String},
    relationship: {
      required: true,
      type: String
    },
    mediator: { // indicates whether user is a mediator to a particular or not
      type: Boolean,
      required: true,
      default: false
    },
    sentAt: Date,
    confirmedAt: {
      type: Date,
      default: null
    } // confirmedAt when NULL means the user has not confirmed the email yet
  }],

  noOfInvitesSent: {
    type: Number,
    default: 0
  },

  invitee: {
    type: Boolean,
    default: false
  },

  invitedBy: [{ // A girl can be invited by multiple people. ex. father, boyfriend
    email: String
  }],

  // roles
  roles: {
    type: Array,
    enum: ['admin', 'retailer', 'user'] //Normal Users are just HW Consumers.
  },

  retailers: [{ type: Schema.Types.ObjectId, ref: 'Retailer' }]

});

function expiryDate() {
  var currentDate = new Date();
  currentDate.setMonth( currentDate.getMonth() + 6 );
  return currentDate;
};

/**
 * Virtuals
 */

UserSchema.virtual('name.full').get(function () {
  return this.name.first + ' ' + this.name.last;
});


/**
 * password virtual getter
 */

UserSchema.virtual('password').get(function() {
  return this._password;
});

/**
 * password virtual setter
 */

UserSchema.virtual('password').set(function(password) {
  var utils = require('../utils')
    , base64Decode = utils.base64decode
    , pw = base64Decode(password);
  this.hash = bcrypt.hashSync(base64Decode(password), bcrypt.genSaltSync(10));
  this._password = password;
});

UserSchema.pre('save', function (next) {
  this.email = this.email.toLowerCase();
  next();
});

/**
 * Statics
 */

UserSchema.statics = {
  authenticate: function(email, password, cb) {
    console.log("@@@@@@@@@Calling to authenticate@@@@@");
    this
      .findOne({ email: email.toLowerCase() },'email hash signInCount')
      // .select('+hash')
      .exec(function(err, user) {
        console.log("@@@@@@@@err");
        if (err) return cb(err);
        if (user) {
          console.log("user.hash"+user.hash)
          if (bcrypt.compareSync(password, user.hash))
            return cb(null, user);
          else
            return cb({errors: ['Invalid Login Credentials'], status: 401});
        } else {
          return cb({errors: ['No User found'], status: 404});
        }
        cb();
      });
  },

  show: function(email, cb) {
    this.findOne({email: email}, function(err, user) {
      if (err) return cb(err);
      if (user) return cb(null, user);
      cb();
    });
  },

  populateUserWithHintlistData: function(id, cb) {

    this.findById(id)
        .populate('retailers','id optId name logo images slug plan description sectors')
        .populate('hintlist.like.product')
        .populate('hintlist.love.product')
        .populate('hintlist.mustHave.product')
        .exec(function(err, user) {

          if (err) return cb(err);
          if (user) {
            console.log("user found in teh first case");
            this.populateHintlistBrands(user, function (err, user) {
              if (err) return cb(err);
              if (user) {
                console.log("user found after populate");

                this.populateHintlistCategories(user, function(err, user) {
                  if (err) return cb(err);
                  if (user) {
                    console.log(user.hintlist.mustHave[0])
                    this.getSectorBasedHintlist(user, function(err, user) {
                      if (err) return cb(err);
                      return cb(null, user);
                    }.bind(this));
                  } else {
                    return cb({errors: ['No user found'], status: 404});
                  }
                }.bind(this));
              } else {
                return cb({errors: ['No user found'], status: 404});
              }
            }.bind(this));
          } else {
            return cb({errors: ['No user found'], status: 404});
          }

        }.bind(this));

  },

  populateHintlistBrands: function(user, cb) {

    var brandsList = [
      'hintlist.like.product.brand',
      'hintlist.love.product.brand',
      'hintlist.mustHave.product.brand'
    ];
    var select = "name optId logo images slug";
    this.populateHintlistMeta(user, brandsList, Brand, cb, select);
  },

  populateHintlistCategories: function(user, cb) {
    var categoriesList = [
      'hintlist.like.product.categories',
      'hintlist.love.product.categories',
      'hintlist.mustHave.product.categories'
    ];
    var select = "name slug sectors";

    this.populateHintlistMeta(user, categoriesList, Category, cb, select);
  },

  populateHintlistMeta: function(user, list, model, cb, select) {
    async.each(list, function (listItem, callback) {
      //console.log("@@@@@@@@@@@Select"+select);
      var pathObject =  { path: listItem };
      if (select) {
        pathObject.select = select; 
      }
      model.populate(user, pathObject,
        function(err, user) {
          if (err) callback(err);
          callback();
        }
      );
    }, function(err) {
      return cb(null, user);
    });
  },

  getSectorBasedHintlist: function(user, cb) {
    var hintlist = user.hintlist
      , _user = user.toObject();

    _user.hintlist = {};
    _.each(sectors, function(sector) {
      _user.hintlist[sector] = {
        mustHave: [],
        love: [],
        like: []
      }
    });

    _.each(['mustHave', 'love', 'like'], function(type) {
      _.each(hintlist[type], function(product) {
        if (product && product.product) {
          _.each(product.product.sectors, function(sector) {
            if (!_user.hintlist[sector]) _user.hintlist[sector] = {};
            if (!_user.hintlist[sector][type]) _user.hintlist[sector][type] = [];
            _user.hintlist[sector][type].push(product);
          });
        } else {
          console.error("no product.product found");
        }
      });
    });

    return cb(null, _user);
  },

  reverseSectorBasedHintlist: function(hintlist, cb) {
    var _hintlist = {
      mustHave: [],
      love: [],
      like: []
    };

    _.each(sectors, function(sector) {
      _.each()
    })


  }

};

/**
 * Methods
 */

UserSchema.methods = {

  notifyConfirmationToInviters: function(app) {

    // notify inviters
    console.log("after sending confirmationEmail ------------------------");
    var inviters = this.invitedBy;
    console.log(inviters);
    for (var i = 0; i <= inviters.length - 1; i++) {
      console.log("trying to send the notification email -----------------------");
      var inviter = inviters[i];

      console.log(inviter);

      console.log(inviter.email);
      var emailparams = {
         invite: this.toObject(),
         user:inviter
      };
      var emailmonq = new EmailMonq(app,emailparams,"notifyInviteJoin");
      
      emailmonq.sendEmail(inviter.email,function (err) {
        if (err) return next(err);
      });
      // app.monq.sendEmail({
      //   to: inviter.email,
      //   from: app.config.sendgrid.sender,
      //   subject: 'Your invite has joined Hint & Whisper',
      //   template: {
      //     params: {
      //       invite: this.toObject()
      //     },
      //     destination: 'invites/notify_invite_join.hbs'
      //   }
      // }, function(err) {
      //   if (err) return next(err);
      // });
    };
  },

  sendPendingInvites: function(app) {
    // sending pending invites
    var invites = this.invites
      , someoneElse = 'someoneElse'
      , len = invites.length -1
      , _this = this;

    console.log("logging the invites for the prospect %%%%%%%%%%%%%%%%%%%%%%");

    for (var i = 0; i <= len; i++) {
      var invite = invites[i]
        , isNotSomeoneElse = (
            invite.sendAs !== someoneElse.toUpperCase() &&  // take care of all cases
            invite.sendAs !== someoneElse.toLowerCase() &&
            invite.sendAs !== someoneElse
            // !invite.mediator // if this is alexis's record for jane
          );

      /**
       * When Steve confirms his account 
       * - his invitations as self, hw, brand would be sent directly
       * 
       * But, when Jane confirms her account
       * - we need to check if she is a mediator for any self invite
       * - thus, the check for NOT A MEDIATOR
       */
      if (isNotSomeoneElse && !invite.mediator) {
        console.log("*****************************************");
        console.log("*****************************************");
        console.log("in teh FIRST.. case --  sending direct emails ");
        console.log("*****************************************");
        console.log("*****************************************");
        // var params = {
        //   to: invite.inviteeEmail,
        //   from: app.config.sendgrid.sender,
        //   subject: 'Come Join Hint & Whisper',
        //   template: {
        //     params: {
        //       user: _this.toObject(),
        //       invite: {
        //         name: invite.name,
        //         inviteeEmail: invite.inviteeEmail
        //       }
        //     },
        //     destination: 'invites/invite_as_self.hbs'
        //   }
        // };
        var emailparams = {
            user: _this.toObject(),
            invite: {
              name: invite.name,
              inviteeEmail: invite.inviteeEmail
            }
        };
        var emailmonq = new EmailMonq(app,emailparams,"inviteAsSelf");
        
        emailmonq.sendEmail(invite.inviteeEmail,function (err) {
          if (err) return next(err);
        });
        // app.monq.sendEmail(params, function(err) {
        //   if (err) return next(err);
        // });
      }

      /**
       * When steve confirms his account and Jane is already a registered user
       * FOR STEVE
       * - the mediator for alexis is true
       * - and the option is someoneElse 
       * - the reason being that Jane is a confirmed registered user then
       *   steve is not an inviter for jane
       */
      if (invite.mediator && !isNotSomeoneElse) {
        console.log("*****************************************");
        console.log("*****************************************");
        console.log("in teh second case --  should get approval email to " + invite.details.email);
        console.log("*****************************************");
        console.log("*****************************************");
        utils.findByEmail(invite.details.email, function(err, mediator, modelName) {
          console.log("in the mediatoremail--------");

          if (mediator) {
            // use mediator.invitee to check if the user signedup on their own or not
            if (modelName === 'Prospect' && mediator.invitee) {
              console.log("---------------------------");
              console.log("---------------------------");
              console.log("the mediator has not confirmed their account --- ");
              console.log("---------------------------");
              console.log("---------------------------");
              // var params = {
              //   to: invite.details.email,
              //   from: app.config.sendgrid.sender,
              //   subject: 'Signup on Hint & Whisper',
              //   template: {
              //     params: {
              //       user: { email: _this.email },
              //       invite: {
              //         name: invite.name,
              //         inviteeEmail: invite.inviteeEmail
              //       }
              //     },
              //     destination: 'invites/invite_as_someoneElse.hbs'
              //   }
              // };
            //  console.log(params);
               var emailparams = {
                   user: { email: _this.email },
                    invite: {
                      name: invite.name,
                      inviteeEmail: invite.inviteeEmail
                    },
                    mediator :invite.details
              };
              var emailmonq = new EmailMonq(app,emailparams,"inviteAsSomeoneElseSignUP");
              
              emailmonq.sendEmail(invite.details.email,function (err) {
                if (err) return next(err);
              });
              // app.monq.sendEmail(params, function(err) {
              //   if (err) return next(err);
              // });

            } else if (modelName === 'Prospect' && !mediator.invitee) {
              console.log("----------------");
              console.log("----------------");
              console.log("the mediator had previously signedup but not confirmed their account");
              console.log("----------------");
              console.log("----------------");
              var user = mediator;
              // var params = {
              //   to: invite.details.email,
              //   from: app.config.sendgrid.sender,
              //   subject: 'Confirm your account on Hint & Whisper',
              //   template: {
              //     params: user.toObject(),
              //     destination: 'invites/confirm_your_account_to_process_invite.hbs'
              //   }
              // };
              // console.log(params);
              // app.monq.sendEmail(params, function(err) {
              //   if (err) return next(err);
              // }); 
              var emailparams = {
                   user: this.toObject(),
                   invite:invite,
                   signedUpFrom: user.signedUpFrom,
                   mediator: mediator.toObject()               
              };
              var emailmonq = new EmailMonq(app,emailparams,"inviteConfirmAccountForSomeOneElse");
              
              emailmonq.sendEmail(invite.details.email , function (err) {
                if (err) console.error(err)
              });            

            } else if (modelName === 'User') {

              console.log("inside the mediator found...");
              // var params = {
              //   to: invite.details.email,
              //   from: app.config.sendgrid.sender,
              //   subject: 'Approve someoneElse Invite request',
              //   template: {
              //     params: {
              //       user: mediator.toObject(),
              //       invite: {
              //         name: invite.name,
              //         inviteeEmail: invite.inviteeEmail
              //       }
              //     },
              //     destination: 'invites/approve_for_someoneElse.hbs'
              //   }
              // };
              // console.log(params);
              // app.monq.sendEmail(params, function(err) {
              //   if (err) return next(err);
              // });
               var emailparams = {
                  user: mediator.toObject(),
                  invite: {
                    name: invite.name,
                    email: invite.inviteeEmail
                  },
                  mediator : invite.details             
              };
              var emailmonq = new EmailMonq(app,emailparams,"approveSomeoneElseInviteRequest");
              
              emailmonq.sendEmail(invite.details.email , function (err) {
                if (err) console.error(err);
              });   

            }
          }
          
        });
      };

      /**
       * when jane confirms her account
       *  - she is a mediator for Alexis
       *  - she in inviting as 'self' which means
       *    isNotSomeoneElse is 'true'
       *
       * In this case, Jane should receive an email asking her to approve
       * Steve's permission
       */ 
      if (invite.mediator && isNotSomeoneElse) {
        console.log("*****************************************");
        console.log("*****************************************");
        console.log("in teh third case --  should get approval email to " + _this.email);
        console.log("*****************************************");
        console.log("*****************************************");
        // var params = {
        //   to: _this.email,
        //   from: app.config.sendgrid.sender,
        //   subject: 'Approve someoneElse Invite request',
        //   template: {
        //     params: {
        //       user: _this.toObject(),
        //       invite: {
        //         name: invite.name,
        //         inviteeEmail: invite.inviteeEmail
        //       }
        //     },
        //     destination: 'invites/approve_for_someoneElse.hbs'
        //   }
        // };
        // app.monq.sendEmail(params, function(err) {
        //   if (err) return next(err);
        // });
        var emailparams = {
          user: _this.toObject(),
          invite: {
            name: invite.name,
            inviteeEmail: invite.inviteeEmail
          },
          mediator :invite.details
        }
        var emailmonq = new EmailMonq(app,emailparams,"approveSomeoneElseInviteRequest");
        
        emailmonq.sendEmail(mediator.email , function (err) {
          if (err) console.error(err);
        });   
      };

    };
  },

  acceptSomeoneElse: function(app, email) {
    // send email

    // app.monq.sendEmail({
    //   to: email,
    //   from: app.config.sendgrid.sender,
    //   subject: 'You have been invited to join Hint & Whisper',
    //   template: {
    //     params: {
    //       user: this.toObject(),
    //       invite: { email: email }
    //     },
    //     destination: 'invites/invite_as_self.hbs'
    //   }
    // }, function(err) {
    //   if (err) return next(err);
    // });
    var emailparams = {
      user: this.toObject(),
      invite: { email: email }
    }
    var emailmonq = new EmailMonq(app,emailparams,"inviteAsSelf");
    
    emailmonq.sendEmail(email , function (err) {
      if (err) return next(err);
    });   

  },

  grantAccess: function(params, cb) {

    params.email = params.addedEmail;

    var grantedUser = params
      , grantedUserFound = _.find(this.privacy.grantedUsers,{email: params.email});

    if (grantedUserFound) return cb({errors: ['User has already been added to allowed list']});

    this.privacy.grantedUsers.push(grantedUser);

    this.save(function(err, user) {

      if (err) return cb(err);
      if (user) cb(null, this);

    });

  },

  revokeAccess: function(email, cb) {
    var grantedUsers = this.privacy.grantedUsers;

    for (var i = 0; i <= grantedUsers.length - 1; i++) {

      if (email === grantedUsers[i].email) {

        this.privacy.grantedUsers = _.reject(grantedUsers, {email: email});
        return this.save(function(err, user) {
          if (err) cb(err);
          if (user) cb(null, user);
        });
      }
    }

    return cb({errors: ['Email was not found']});
  },

  forgotPassword: function(email, cb) {

    this.resetPasswordSentAt = new Date();
    this.resetPasswordToken = crypto.randomBytes(32).toString('hex');
     
    this.save(function(err, user) {
      if (err) return cb(err);
      if (user) return cb(null, user);
    });

  },

  addToHintlist: function(type, products, cb) {
    console.log("on addToHintlist........");
    //console.log("the sector is ", sector);
    var updatedProducts = []
      , len = products.length
      , _this = this, sectors;

    async.series([
      function(callback) {

        function findAndPushProducts(count) {

          if (count < len) {

            var id = products[count];

            Product.findById(id, function(err, prd) {
              if (err) return cb(err);
              if (prd) {
                sectors = prd.sectors;
                _this.findFromHintlist(id, function(err, fromType, productObj) {
                  if (fromType) {

                    //If the same hintlist option is clicked.
                    if (fromType === type) {
                      cb({errors: ['The product has already been added to Hintlist']});
                    } else {


                      //If a different hintlist option is clicked.

                      var oldHintList = _this.hintlist[fromType];
                      var newHintList = _this.hintlist[type];

                      var prodObj = _.find(oldHintList, function(obj) {
                        return obj.product.toString() == id;
                      });

                      var oldHintList = _.reject(oldHintList, function(obj) {
                        return obj.product.toString() == id;
                      });

                      if (!newHintList) newHintList = [];

                      newHintList.push(prodObj);

                      _this.hintlist[fromType] = oldHintList;
                      _this.hintlist[type] = newHintList;

                      //Handle product hintlist counts

                      var oldCountString, newCountString, oldCount, newCount;
                      if (prodObj) {
                        oldCountString = fromType + 'Count';
                        oldCount = prd[oldCountString];
                        if (oldCount > 0) {
                          prd[oldCountString] = oldCount - 1;
                        }
                      }
                      newCountString = type + 'Count';
                      newCount = prd[newCountString];
                      prd[newCountString] = newCount + 1;

                      prd.save(function(err, prd) {
                        if (err) {
                          console.log(err);
                        }
                        callback(null);
                      });


                    }

                  } else {

                    //Handle product hintlist count
                    var newCountString, newCount;
                    newCountString = type + 'Count';
                    newCount = prd[newCountString];
                    prd[newCountString] = newCount + 1;
                    prd.save(function(err, prd) {
                      if (err) {
                        console.log(err);
                      }
                      callback(null);
                    });

                    updatedProducts.push(prd.id);
                    count ++;
                    findAndPushProducts(count);
                  }
                });
              } else {
                return cb({errors: ['Product not found']});
              }
            });

          } else {

            callback(null);
          }
        }

        findAndPushProducts(0);

      },
      function(callback) {

        var products = _.uniq(updatedProducts, function(id) {
          return id.toString();
        });

        _.each(products, function(id) {
          _this.hintlist[type].push({ product: id, sectors: sectors });
        });
        console.log('@@@@@@@@@@@@@Saving new hintlist@@@@@@');
        // console.log("@@@@@@@@Object Size"+_this.toObject().size);
       console.log("@@@@Object Size@@@@@@"+JSON.stringify(_this.toObject()).length);
        _this.save(function(err, user) {
          if (err) return cb(err);
          if (user) return cb(null, user);
        });

      }
    ]);

  },

  findFromHintlist: function(id, cb) {

    var _this = this
      , val;

    var mustHaves = this.hintlist.mustHave
      , loves = this.hintlist.love
      , likes = this.hintlist.like;
    
    console.log("mustHaves  ::"+id+"---"+JSON.stringify(mustHaves));

    val = _.find(mustHaves, function(obj) {
      return obj.product.toString() == id;
    });
    console.log("val"+val);
    if (val) return cb(null, 'mustHave', val);

    val = _.find(loves, function(obj) {
      return obj.product.toString() == id;
    });

    if (val) return cb(null, 'love', val);

    val = _.find(likes, function(obj) {
      return obj.product.toString() == id;
    });

    if (val) return cb(null, 'like', val);

    return cb();

  }

};

module.exports = mongoose.model('User', UserSchema);

