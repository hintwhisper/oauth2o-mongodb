
/**
 * native deps
 */

var crypto = require('crypto')
  , path = require('path')
  , fs = require('fs');

/**
 * 3rd deps
 */

var mongoose = require('mongoose')
  , validate = require('mongoose-validator').validate
  , Schema = mongoose.Schema
  , bcrypt = require('bcrypt')
  , User = require('../models/User')
  , utils = require('../utils')
  , EmailMonq = require('../utils/email');

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

var sendAsTypes = ['self', 'hw', 'someoneElse', 'brand'];

var ProspectSchema = new Schema({
  name: { first: String, last: String },
  hash: { type: String }, // temp setup to remove select false
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [ validate('len', 6, 64), validate('isEmail') ]
  },

  signedUpFrom: String,

  provider: String,
  birthDate: String,
  weddingDate: String,
  expectedWeddingDate: Date,
  description: String,
  resetPasswordToken: { type: String, default: null },
  resetPasswordSentAt: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  confirmationToken: { type: String },
  lastSignIn: String,
  currentSignIn: String,
  confirmedAt: Date,
  confirmationTokenSentAt: Date,
  currentLocation: String,
  foundTheOne: { type: String },
  engagementTiming: { type: String },
  relationshipStatus: { type: String }, // Facebook and google store relations with different case. Thus, commenting to avoid complications for now. - kt
  zipCode: String,
  gender: {
    type: String,
    enum: ['Male', 'Female']
  },

  // deals only with the profile updates
  profileCreatedAt: Date,
  profileUpdatedAt: Date,

  // profiles schema
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
    name: {first:String,last:String}, //name of the requester
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
      name: String,
      email: String,
      relationship: String
    }
  }],

  /**
   *  All the requests made by user to access profile
   *  These requests will be processed once the user confirms their account
   */
  requestsMade: [{
    to: String, // user's email
    as: String,
    name: {first: String, last: String},
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
    name: {first :String,last:String},
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

  // pending approvals
  pendingApprovals: [{    to: String,    // user's email
    from: String, //requester
    name: {first:String,last:String},
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
    inviterEmail:{
      type:String
    },
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
 *  Pre hook for save
 */

ProspectSchema.pre('save', function(next) {
  if (!this.confirmationToken) {
    this.confirmationTokenSentAt = new Date; // remove this from here
    this.confirmationToken = crypto.randomBytes(32).toString('hex');
  };
  next();
});

/**
 * virtual password getter
 */

ProspectSchema.virtual('password').get(function() {
  return this.hash;
});

/**
 * virtual password setter
 */

ProspectSchema.virtual('password').set(function(password) {
  //if (!this.hash) {
    this.hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    this._password = password;
  //}
});


/******************
 * Static Methods
 ******************/


ProspectSchema.statics = {

  confirmAccount: function(email, token, cb) {
    console.log('inside the confirm account...');
    this.findOne({ email: email,confirmationToken:token }, function(err, user) {
      if (err) return cb(err);
      if (user) {
        user.emptyConfirmationToken();
        return cb(null, user);
      }
      return cb();
    });
  },

  /**
   * This would confirm the user and move the Prospect to users collection
   * Parked temporarily because we don't have the access to User model
   */
  newPassword: function (email, token, password, cb) {
    this.findOne({ email: email, confirmationToken: token }, function (err, Prospect) {
      if (err) return cb(err);
      if (!Prospect) return cb(); // throw 404 error somehow
      if (Prospect) {
        var newUser = Prospect;

        newUser.confirmedAt = new Date;
        newUser.confirmationToken = newUser.confirmationTokenSentAt = null;

        var user = new User( newUser );

        user.save(function(err, user) {
          if (err) return cb(err);
          if (user) {
            Prospect.remove(function(err) {
              if (err) return cb(err);
            });
          };
          return cb(null, user);
        });

      };

    });

  },

  invite: function(params, inviter, cb) {
    var self = this;//self refer to prospect object
    this.findOne({email: params.email},function (err, prospectobject) {//this condition when invitee is already prospect invitee user
      if (err) return next(err);
      else if(prospectobject){
        prospectobject.invitedBy.push({email: params.inviterEmail});
        prospectobject.save(function(err, prospect1) {
          if (err) return cb(err);
          if (prospect1) {

          // user model instances
          // inviter.updateInvites(params, prospect, cb);
          utils.updateInvites(params, inviter, prospectobject, cb);
          };
        });
      }else{
         var prospect = new self(params);
          prospect.invitee = true;
          prospect.name = params.inviteeName;
          prospect.invitedBy.push({email: params.inviterEmail});
          prospect.save(function(err, prospect) {
            if (err) return err;
            utils.updateInvites(params, inviter, prospect, cb);
          })
      }
       
    })
  },

  show: function(email, cb) {
    this.findOne({email: email}, function(err, user) {
      if (err) return cb(err);
      if (user) return cb(null, user);
      cb();
    });
  }

};
/**
 * confirm the user account by updating the confirmationToken
 */

ProspectSchema.methods.emptyConfirmationToken = function( next ) {
  this.confirmationToken = this.confirmationTokenSentAt = null;
  this.save(function(err) {
    if (err) return next(err);
  });
};

ProspectSchema.methods.addPasswordForNewSignUp = function(password, cb) {
  this.password = password;
  this.save(function(err, prospect) {
    if (err) {
      return cb(err);
    };
    return cb(null, prospect);
  });
};

ProspectSchema.methods.sendConfirmationEmail = function(app, next) {
  console.log("@@@@@signedUpFrom"+this.signedUpFrom)
  if (this.signedUpFrom === 'master-home' || 
      this.signedUpFrom === 'master' || 
      !this.signedUpFrom) {
    this.signedUpFrom = 'login';
  } else {
    this.signedUpFrom = (this.signedUpFrom + '/login');
  }
  var params = {
    user: this.toObject(),
    signedUpFrom: this.signedUpFrom
  }
  console.log("@@@@@params " + params.signedUpFrom)
  var emailmonq = new EmailMonq(app,params,"confirmAccount");
                            
  emailmonq.sendEmail(this.email,function (err) {
    if (err) return next(err);
  });

  
};
ProspectSchema.methods.forgotPassword =  function(email, cb) {

    this.resetPasswordSentAt = new Date();
    this.resetPasswordToken = crypto.randomBytes(32).toString('hex');
     
    this.save(function(err, user) {
      if (err) return cb(err);
      if (user) return cb(null, user);
    });

  }


module.exports = mongoose.model('Prospect', ProspectSchema);

