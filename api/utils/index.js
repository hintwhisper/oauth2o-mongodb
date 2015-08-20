
/**
 *  Custom utilities
 */

var _ = require('lodash')
  , User = require('../models/User')
  , Prospect = require('../models/Prospect')
  , Retailer = require('../models/Retailer')
  , EmailMonq = require('./email')

exports.base64encode = function(str) {
  return new Buffer(str).toString('base64');
};

exports.base64decode = function(str) {
  return new Buffer(str, 'base64').toString('ascii');
};

exports.isValidObjectID = function(str) {
  var len = str.length, valid = false;
  if (len == 12 || len == 24) valid = /^[0-9a-fA-F]+$/.test(str);
  return valid;
};

exports.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

exports.setMultipleRetailers = function(obj, body, cb) {
  var retailers = body.retailers
    , len = retailers.length
    , newRetailers = []
    , prevRetailers = obj.retailers;
  
  function setRetailer(count) {
    if (count < len) {
      Retailer.findById(retailers[count], function(err, retailer) {
        if (retailer) newRetailers.push(retailers[count]);
        count++;
        setRetailer(count);
      });
    } else {
      obj.retailers = _.union(obj.retailers, newRetailers);
      obj.save(function(err, obj) {
        if (err) return cb(err);
        if (obj) return cb(null, obj)
      });
    }
  }
  setRetailer(0);
};

exports.toCamelCase = (function () {
  var DEFAULT_REGEX = /[-_]+(.)?/g;

  function toUpper(match, group1) {
    return group1 ? group1.toUpperCase() : '';
  }
  return function (str, delimiters) {
    return str.replace(delimiters ? new RegExp('[' + delimiters + ']+(.)?', 'g') : DEFAULT_REGEX, toUpper);
  };
})()

exports.getInviteTemplate = function(sendAs, invite, user, mediator) {

  switch(sendAs) {

    case 'hw':
      return {
        destination: 'invites/invite_as_' + sendAs + '.hbs',
        params: {
          invite: invite.toObject()
        }
      }
      break;

    case 'self':
      return {
        destination: 'invites/invite_as_' + sendAs + '.hbs',
        params: {
          user: user ? user.toObject() : null,
          invite: invite.toObject()
        }
      }
      break;

    case 'brand':
      return {
        destination: 'invites/invite_as_' + sendAs + '.hbs',
        params: {
          invite: invite.toObject()
        }
      }
      break;

    case 'someoneElse':
      return {
        destination: 'invites/invite_as_' + sendAs + '.hbs',
        params: {
          invite: invite,
          user: user.toObject(),
          mediator: mediator.toObject()
        }
      }
      break;

  };

};

// called when updating mediators records for invites
exports.updateInvites = function(params, user, prospect, cb) {
  // if (prospectiveMediator) {
  var details;

  details = {
    name: params.someoneElseName,
    email: params.someoneElseEmail,
    relationship: params.someoneElseRelationship
  };

  user.invites.push({

    details: details,
    // indicating jane is the mediator for alexis
    // or if steve is inviting with options other than someoneElse
    mediator: (params.sendAs === 'someoneElse'),
    sendAt: new Date(),
    sendAs: params.sendAs,
    inviteeEmail: params.email,
    relationship: params.relationship

  });

  user.save(function(err, user) {

    if (err) return cb(err); //handle errors, no next variable TODO

    if (user) {
      // send email
      cb(null, prospect, user);
    };
  });
  // } else {
  //   console.log("****** mediator is registered ********************");
  //   cb(null, prospect, user);
  // }

},


/**
 *  Add requests to prospect or user
 */
exports.requests = function(args, cb) {
  var _this = this;

  var app = args.app
    , user = args.user
    , params = args.params
    , requester = args.requester;

  var requesterParams = args.requesterParams = {
    email: requester.email,
    name: requester.name,
    invitee: true,
    relationship: params.relationship, //relationship of requester to the user
    as: params.as //self, hw ...
  };
 // console.log("@@@@@@@requesterParams"+JSON.stringify(requesterParams))
  if (params.as === 'gatekeeper' || params.gatekeeper) {

    requesterParams.gatekeeper = params.gatekeeperEmail;

    /**
      * Check for gatekeeper's validity
      */
    var grantedUsers = user.privacy.grantedUsers;

    var gatekeeperEntry = _.find(grantedUsers, function(record) {
      return record.email === params.gatekeeper && record.gatekeeper;
    });

    if (gatekeeperEntry) {

      // gatekeeper privileges should not have expired
      if (gatekeeperEntry.expiry > new Date()) {

        _this.addPendingApprovals(args, function(err, gatekeeper) {
          if (err) return cb(err);

          if (gatekeeper) {

            // _this.addRequests(args, requesterParams, cb);
            // app.monq.sendEmail({
            //   to: params.gatekeeper, //freezed code
            //   from: app.config.sendgrid.sender,
            //   subject:  requester.email + ' has requested access from you, the gatekeeper',
            //   template: {
            //     params: {
            //       user: user.toObject(),
            //       requester: requester.toObject()
            //     },
            //     destination: 'requests/request_to_gatekeeper.hbs'
            //   }
            // }, function(err) {
            //   if (err) return cb(err);
            // });
             var emailparams = {
                user: user.toObject(),
                requester: requester.toObject()
              }
             // console.log("logging templateOptions ----------------");
             // console.log(templateOptions);
              var emailmonq = new EmailMonq(app , emailparams , 'requestAsGatekeeper');
              emailmonq.sendEmail(params.gatekeeper,function (err) {
                if (err) return next(err);
              });

            cb(null, user);
          }; //if gatekeeper
        }); //add pending approvals
      } else {

        cb({errors: ['Gatekeeper privileges are expired'], status: 401});
      };
    } else {
      cb({errors: ['Not a valid Gatekeeper']});
    };

  } else if (params.as === 'someoneElse') {

    /**
     * SomeoneElse
     */

    requesterParams.someoneElse = {
      name: params.someoneElseName,
      email: params.someoneElseEmail,
      invitee: true,
      relationship: params.someoneElseRelationship
    };

    _this.addPendingApprovals(args, function(err, someoneElse, newSomeoneElse) {
      if (err) return cb(err);

      if (someoneElse) {

        // _this.addRequests(args, requesterParams, cb);

        return cb(null, requester);

      };

      // if (someoneElse) {
      // };
    });

  } else {
    _this.addRequests(args, requesterParams, cb);
  }

};

exports.addRequests = function(args, requesterParams, cb) {

  var _this = this;

  var app = args.app
    , user = args.user
    , params = args.params
    , requester = args.requester
    , requesterParams = args.requesterParams;
  //Changes by sunil 
  // To check requester already requst or not
  //if yes >> no need to store record in requests
  // if no>>store requst 
  if (! _.findWhere(user.requests,{email:requesterParams.email})){
    user.requests.push(requesterParams);
  }  
  
  //console.log("@@@@@@@@@@@User after requests@@@@@"+user.requests)
  if (_.isUndefined(requester.requestsMade)) requester.requestsMade = [];

  /**
   * save the requests made by the requester
   */
  var userParams = {
    to: user.email,
    name: user.name,
    as: params.as,
    relationship: requesterParams.relationship
  };

  if (params.as === 'gatekeeper' || params.gatekeeper)
    userParams.gatekeeper = requesterParams.gatekeeper;
  
  if (params.as === 'someoneElse' || params.someoneElse)
    userParams.someoneElse = params.someoneElseEmail;

  requester.requestsMade.push(userParams);

  user.save(function(err, updatedUser) {
    if (err) return cb(err);
    if (updatedUser) {

      requester.save(function(err, requester) {
        if (err) return cb(err);
        if (requester) {

          var mediatorEmail = false;

          // determine the mediator email - could be gatekeeper or someoneElse
          if (params.gatekeeper || params.as === 'gatekeeper')
            mediatorEmail = params.gatekeeper;
          if (params.as === 'someoneElse')
            mediatorEmail = params.someoneElseEmail;

          var templateParams = {
            app: app,
            user: updatedUser,
            sendAs: params.as,
            requester: requester,
          };

          if (mediatorEmail) templateParams.mediatorEmail = mediatorEmail;

          // send an email to the end user
          // this should be DRYed, there is args already
          var templateOptions = _this.getRequestTemplate(templateParams);

          console.log("Logging templateOptions 777777777777777777");
          console.log(templateOptions);

          // send an email to gatekeeper or the end user
          // only if the user is not a new user
          if (!params.newUser) {
            console.log("the user has already confirmed their account, thus sending the email to teh end user or gatekeeper");
            // app.monq.sendEmail(templateOptions, function(err) {
            //   if (err) return cb(err);
            // });
            var templateOptions = _this.getRequestTemplate(templateParams);
            var emailparams = templateOptions.template.params;
             // console.log("logging templateOptions ----------------");
             // console.log(templateOptions);
             var emailType = {
              self: 'requestAsSelf',
              brand: 'requestAsBrand',
              hw: 'requestAsHw',
              someoneElse: 'requestAsSomeoneElse',
              gatekeeper : 'requestAsGatekeeper'
             }
              var emailmonq = new EmailMonq(app , emailparams , emailType[templateParams.sendAs]);;
              emailmonq.sendEmail(templateOptions.to, function (err) {
                if (err) return next(err);
              });
          } else {
            console.error("the user HAS NOT CONFIRMED their account, not sending emails to anynoe");
          }

          return cb(null, user);

        } // if requester
      }); // save requester
    } // if updatedUser
  }); // save user

};

/**
 *  Pending approvals is only for Gatekeepers and someoneElse option
 */
exports.addPendingApprovals = function(args, cb) {

  var mediatorEmail
    , _this = this;

  var app = args.app
    , user = args.user
    , params = args.params
    , requester = args.requester
    , requesterParams = args.requesterParams;

  if (params.gatekeeper) mediatorEmail = params.gatekeeper;

  if (params.as === 'someoneElse') {
    var someoneElse = true;
    mediatorEmail = params.someoneElseEmail;
  }

  var approvals = {
    to: user.email, // user's email
    from: requester.email, //requester
    name: requester.name,
    relationship: params.relationship, // relationship to Alexis
  };
  
  

  console.log('@@@@@@@@@ Approval')
  console.log(approvals)
  if (_.isUndefined(requester.requestsMade)) requester.requestsMade = [];

  /**
   * save the requests made by the requester
   */
  var userParams = {
    to: user.email,
    name: user.name,
    as: params.as,
    relationship: params.relationship
  };

  if (params.as === 'gatekeeper' || params.gatekeeper)
    userParams.gatekeeper = requesterParams.gatekeeper;
  
  if (params.as === 'someoneElse' || params.someoneElse)
    userParams.someoneElse = params.someoneElseEmail;

  requester.requestsMade.push(userParams);

  requester.save();

  // mediator could be a Gatekeeper or someoneElse
  this.findByEmail(mediatorEmail, function(err, mediator, modelName) {

    if (err) return cb(err);
    if (mediator) {

      if (someoneElse) approvals.someoneElse = true;
      //To check from & to already exists
      if (!_.findWhere(mediator.pendingApprovals,{from: approvals.from, to: approvals.to})){
         mediator.pendingApprovals.push(approvals); 
      }
     
      mediator.save(function(err) {
        if (err) return cb(err);
        if (mediator) {

          console.log("************* line no 405 *******");

          if (modelName === 'Prospect') {

            console.log(" ************ line no 407 *****************");

            // send confirmation email...
            // app.monq.sendEmail({
            //   to: params.someoneElseEmail,
            //   from: app.config.sendgrid.sender,
            //   subject:  'Confirm your account to process requests',
            //   template: {
            //     params: { user: mediator.toObject() },
            //     destination: 'requests/confirm_your_account_to_process_request.hbs'
            //   }
            // }, function(err) {
            //     if (err) return next(err);
            // });
              if (mediator.invitee){//prospect user but not invitee
                    var emailparams = {
                    user: user.toObject(),
                    requester: requester.toObject(),
                    gatekeeper: {
                      email: params.someoneElseEmail
                    }
                  }
             // console.log("logging templateOptions ----------------");
             // console.log(templateOptions);
              var emailmonq = new EmailMonq(app , emailparams , 'signupToSendAsSomeoneElse');
              emailmonq.sendEmail(params.someoneElseEmail,function (err) {
                if (err)  console.log(err);
              });

            } else{//unconfirmed user
                 var emailparams = {
                 user: user.toObject(),
                 requester: requester,
                 mediator :mediator,
                 signedUpFrom: mediator.signedUpFrom 
                }
             // console.log("logging templateOptions ----------------");
             // console.log(templateOptions);
             //Here rather than sending Approval email requestAsSomeon
              // var emailmonq = new EmailMonq(app , emailparams , 'confirmToSendAsSomeoneElse');
              // emailmonq.sendEmail(params.someoneElseEmail,function (err) {
              //   if (err) console.log(err)
              // });
              var emailmonq = new EmailMonq(app , emailparams , 'confirmToSendAsSomeoneElse');
              emailmonq.sendEmail(params.someoneElseEmail,function (err) {
                if (err) console.log(err)
              });
         
            }
         
          } else {

            // send email about someoneElse option
            if (someoneElse) {
              // app.monq.sendEmail({
              //   to: params.someoneElseEmail,
              //   from: app.config.sendgrid.sender,
              //   subject:  requester.email + ' has requested access from you via the someoneElse option',
              //   template: {
              //     params: {
              //       user: user.toObject(),
              //       requester: requester.toObject(),
              //       gatekeeper: {
              //         email: params.someoneElseEmail
              //       }
              //     },
              //     destination: 'requests/request_as_someoneElse.hbs'
              //   }
              // }, function(err) {
              //     if (err) return next(err);
              // });
             var emailparams = {
               user: user.toObject(),
               requester: requester.toObject(),
               mediator: {
                email:params.someoneElseEmail
               } 
            }
             // console.log("logging templateOptions ----------------");
             // console.log(templateOptions);

            var emailmonq = new EmailMonq(app , emailparams , 'requestAsSomeOneElse');
            emailmonq.sendEmail(params.someoneElseEmail,function (err) {
              if (err)  console.log(err)
            });

          }

          
        }
        return cb(null, mediator, false);
      }
    });

    } else {

      // no mediator with email found :(

      if (someoneElse) {
        // create a prospect if someoneElse
        var prospect = new Prospect();

        Prospect.create({ email: mediatorEmail, invitee: true }, function(err, prospect) {
          if (err) return cb(err);
          if (prospect) {

            if (_.isUndefined(prospect.requestsMade)) prospect.requestsMade = [];

            /**
             * save the requests made by the prospect
             */
            var userParams = {
              to: user.email,
              name: user.name,
              as: params.as,
              relationship: params.relationship
            };

            if (params.as === 'someoneElse' || params.someoneElse)
              userParams.someoneElse = params.someoneElseEmail;

            prospect.requestsMade.push(userParams);

            // save the pending approvals with someoneElse true
            approvals.someoneElse = true;
            if (!_.findWhere(prospect.pendingApprovals,{from: approvals.from, to: approvals.to})){
              prospect.pendingApprovals.push(approvals);
            }
            

            prospect.save(function(err, prospect) {
              if (err) return cb(err);
              if (prospect) {

                // app.monq.sendEmail({
                //   to: params.someoneElseEmail,
                //   from: app.config.sendgrid.sender,
                //   subject:  requester.email + ' has requested you to join Hint & Whisper to further request access to profile',
                //   template: {
                //     params: {
                //       user: user.toObject(),
                //       requester: requester.toObject(),
                //       gatekeeper: {
                //         email: params.someoneElseEmail
                //       }
                //     },
                //     destination: 'requests/signup_to_send_as_someoneElse.hbs'
                //   }
                // }, function(err) {
                //     if (err) return next(err);
                // });
              var emailparams = {
                user: user.toObject(),
                requester: requester.toObject(),
                gatekeeper: {
                  email: params.someoneElseEmail
                }
              }
             // console.log("logging templateOptions ----------------");
             // console.log(templateOptions);
              var emailmonq = new EmailMonq(app , emailparams , 'signupToSendAsSomeoneElse');
              emailmonq.sendEmail(params.someoneElseEmail,function (err) {
                if (err) console.log(err)
              });

                return cb(null, prospect, true);
              }
            });
          };
        });

      } else {

        cb({errors: ['No record with gatekeeper email ' + mediatorEmail + ' found'], status: 404});
      }
    }
  });

};

exports.getRequestTemplate = function(params) {

  var app = params.app
    , user = params.user
    , sendAs = params.sendAs
    , requester = params.requester
    , mediatorEmail = params.mediatorEmail;

  switch(sendAs) {

    case 'hw':
    case 'self':
    case 'brand':
      return {
        to: user.email,
       
        template: {
          params: {
            user: user.toObject(),
            requester: requester.toObject()
          },
         templatename: 'requests/request_as_' + sendAs + '.hbs'
        }
      };

      break;

    case 'someoneElse':
      return {
        to: mediatorEmail, //freezed code
    
        template: {
          params: {
            user: user.toObject(),
            requester: requester.toObject(),
            mediator: {
              email: mediatorEmail
            }
          },
          destination: 'requests/request_as_someoneElse.hbs'
        }
      };
      break;

    default:
      return {
        to: mediatorEmail,
        from: app.config.sendgrid.sender,
        subject:  requester.email + ' has requested access from you, the gatekeeper',
        template: {
          params: {
            user: user.toObject(),
            requester: requester.toObject(),
            gatekeeper: {
              email: mediatorEmail
            }
          },
          destination: 'requests/request_to_gatekeeper.hbs'
        }
      };
      break;
  };

};

/**
 *  Finds the user based on the email in Prospect and User model
 */
exports.findByEmail = function(email, cb) {

  var query = { email: email };

  User.findOne(query, function(err, user) {
    if (err) return cb(err);
    if (user) return cb(null, user, 'User');

    Prospect.findOne(query, function(err, user) {
      if (err) return cb(err);
      if (user) return cb(null, user, 'Prospect');
      if (!user) return cb();
    });
  });
};

// db.users.update( {email: 'thirthappa.kaushik@gmail.com' }, { $pop: { requests: 1 } } );

// recursive function to get all keys in an array for a JS object
exports.collectKeys = function collectKeys (obj, allKeys) {

  for (key in obj) {
    var rule = obj[key];
    if (rule instanceof Object) {

      allKeys.push(key);
      collectKeys(rule, allKeys);

    } else if (rule instanceof Array) {

      allKeys.push(key);
      function collectKeysFromArray(key, allKeys) {
        for (k=0; k<rule.length; k++) {
          var innerRule = key[k];

          // if array
          if (innerRule instanceof Array) {
            collectKeysFromArray(innerRule, allKeys);
          } else if (innerRule instanceof Object) {

            // if object
            collectKeys(key, allKeys);
          }
        }
      }

      collectKeysFromArray(key, allKeys);

    } else {
      allKeys.push(key);
    }
  }

  return allKeys;
};

