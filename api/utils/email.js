
//defile all partials
var partialKeys = {

//BEGIN New Defaults for testing - ck
  defaultHeader: 'defaultHeader',
  defaultBody: 'defaultBody',
  defaultFooter: 'defaultFooter',
//END  New Defaults for testing - ck

//Older ones setup for testing - not sure they will be in use
  logo: 'logos/logo',
  header: 'header',
  footer: 'footer',
  signup: 'signup',
  signin: 'signin',
  appointment:'generic/appointment',
  product: 'generic/product',
  brand: 'generic/brand',
  retailer: 'generic/retailer',
  invite: 'generic/invite',
  confirm: 'confirm',
  xSnippet: 'x_snippet'
};

var emailTypeObject = {

//Registration Related



  'confirmAccount': { //ck read - Email is sent to the user after successfully signing up so as to confirm the email address - not applied for facebook sign up
    subject: 'Welcome to Hint & Whisper! Activate your account by confirming your email address.',
    email: {
				title: 'Hint & Whisper - Confirm Your Account',
    		salutation: 'Hi {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/email-confirmation.jpg',
        htmlText1: '<p>Thank you for registering at Hint & Whisper! Welcome to our growing community of friends helping to give romance a little boost!</p><p>To finish creating your account, use the button below to <a href="{{host}}/confirm-account?email={{user.email}}&token={{user.confirmationToken}}&redirectTo=/{{signedUpFrom}}">confirm your email address</a>.</p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Confirm My Email Address',
        buttonLink: '{{host}}/confirm-account?email={{user.email}}&token={{user.confirmationToken}}&redirectTo=/{{signedUpFrom}}'
    },
    baseEmailTemplate: 'registrations/confirm_account'
    
  },

  'forgotPassword': { //ck read - Email is sent if the user has forgotten their password. Consists of a permalink () 
    subject: 'Reset your Hint & Whisper password',
    email: {
				title: 'Hint & Whisper - Forgot Password',
				salutation: 'Hi {{user.name.first}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/horizontal-key.jpg',
        htmlText1: '<p>Forgot your Hint & Whisper password? No worries. Use the button below to <a href="{{host}}/reset-password/{{user._id}}?token={{user.resetPasswordToken}}">reset it</a> and get back to learning, sharing, hinting, and planning for your future romance.</p>',
        htmlText2: '<p>If you did not request a password reset, you may disregard this email and no changes will be made to your account.</p>',        
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Reset My Password',
				buttonLink: '{{host}}/reset-password/{{user._id}}?token={{user.resetPasswordToken}}'
    },
    baseEmailTemplate: 'registrations/forgot_password'
  },

// INVITE

  'inviteByUnregisteredUser': { //ck read - A wants to invite B - A has not signed up - Email to A asking to signup so as to process all the invites he/she has sent
    subject: 'Your Hint & Whisper Invite is almost ready to go out.',
    email: {
				title: 'Hint & Whisper - Sign up',
    		salutation: 'Hi {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/invitation.jpg',
        htmlText1: '<p>We’re ready to forward the Invite you sent to {{#if invite.name}}{{invite.name.first}}({{invite.email}}){{else}}{{invite.email}}{{/if}}, but we need a little more information from you. Complete your registration now to send Invites, build your Hintlist, and view your love’s Hintlist. </p><p>Never again wonder if you’re picking out something your loved one will cherish. With Hint & Whisper, the perfect gift is just a hint and whisper away. </p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Finish My Hint & Whisper Registration',
        buttonLink: '{{host}}/signup'
    },
      baseEmailTemplate: 'invites/invite_by_unregistered_user'
    
  },

  
  'inviteConfirmAccount': { //ck read - A wants to invite B - A has not confirmed account - Email to A asking to confirm their account so as to process all the invites he/she has sent
    subject: 'Your Hint & Whisper invite is almost complete - please confirm your email address.',
    email: {
				title: 'Hint & Whisper - Confirm Your Account',
    		salutation: 'Hi {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/invitation.jpg',
        htmlText1: '<p>Thank you for registering at Hint & Whisper. Welcome to our growing community of friends helping to give romance a little boost! </p><p>We just need you to <a href="{{host}}/confirm-account?email={{user.email}}&token={{user.confirmationToken}}&redirectTo=/{{signedUpFrom}}">confirm your email address</a> to finish processing the Invite. Use the button below to <a href="{{host}}/confirm-account?email={{user.email}}&token={{user.confirmationToken}}&redirectTo=/{{signedUpFrom}}">confirm your email address<a>, and share Hint & Whisper with your favorite people. </p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Confirm My Email Address',
        buttonLink: '{{host}}/confirm-account?email={{user.email}}&token={{user.confirmationToken}}&redirectTo=/{{signedUpFrom}}'
    },
    baseEmailTemplate: 'invites/confirm_your_account_to_process_invite'
    
  },

  'inviteAsSelf': { //ck read - A invites B - Email to B informing that
		subject: 'You should REALLY be on Hint and Whisper (This is your Hint!).',
    email: {
				title: 'Hint & Whisper - Invitation to Join',
    		salutation: 'Hi {{#if invite.name}}{{invite.name.first}}{{else}}{{invite.email}}{{invite.inviteeEmail}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/invitation.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}} {{user.name.last}}{{else}}{{user.email}}{{/if}} is on Hint & Whisper and wants you to join! </p><p>Have you ever wondered how couples can pick out just the right glittery gifts without spilling the surprise?  Hint and Whisper is the solution!</p><p><a href="{{host}}/signup">Set up an account and build your Hintlist</a>. They have all the top brands and A-list designers for you to explore, from carefully selected jewelers nationwide. Pick out favorite styles, stones, metals and settings, and rate selected designs from <strong>like</strong> to <strong>love</strong> to <strong>must have</strong>. </p><p>Explore your loved ones’ profiles to gauge their taste in jewelry and select from their top picks or a yet-unseen design that perfectly matches both of your preferences! </p><p>Hint and Whisper helps couples find the perfect gift, plan the perfect moment, and prepare for the perfect day. </p><p><a href="{{host}}/signup">Join now</a> to create your own Hintlist, request full profile access, and tap into Hint & Whisper’s wealth of information and support for your romance. </p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Explore Hint & Whisper',
        buttonLink: '{{host}}/signup'
    },
		baseEmailTemplate: 'invites/invite_as_self'
    
  },

  'inviteAsHW':{ //ck read - Someone (Anyone) invited B on behalf of HW - Email to B informing that
    subject: 'Get a Hint! Join Hint & Whisper.',
    email: {
				title: 'Hint & Whisper - Invitation to Join',
    		salutation: 'Hi {{#if invite.name}}{{invite.name.first}}{{else}}{{invite.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/invitation.jpg',
        htmlText1: '<p>Have you ever wondered how couples can pick out just the right glittery gifts without spilling the surprise?  Hint and Whisper is the solution!</p><p>Hint and Whisper takes the guesswork out of gift-giving without spoiling the fun.</p><p>Start your account now, it’s easy! You can <a href="{{host}}/signup">browse and rate our extensive collection of jewelry and accessories</a> from like to love to must have. Then check out your love’s Hintlist to pick out a longed-for treasure for the perfect gift, or gather clues for a brand-new discovery in the perfect style. Your love won’t know when you’re looking for hints, and you’ll never know what your love found - until the moment arrives! </p>',
        htmlText2: '<p>At Hint and Whisper, people get what they want, without saying a word.</p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Explore Hint & Whisper',
        buttonLink: '{{host}}/signup'
    },
    baseEmailTemplate: 'invites/invite_as_hw'
    
  },


  'inviteAsSomeoneElseSignUp': { //ck read - A wants to invite B via someoneElse as C - C has not signed up - Email to C asking to signup so as to invite B
		subject: 'Please help {{#if invite.name}}{{invite.name.first}}{{else}}{{invite.email}}{{/if}}, with Hint & Whisper!',
    email: {
				title: 'Hint & Whisper - Invite',
    		salutation: 'Hi {{#if mediator.name}}{{mediator.name.first}}{{else}}{{mediator.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/invitation.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} found a great way to subtley share special gift hints with {{#if invite.name}}{{invite.name.first}}{{else}}{{invite.email}}{{/if}} at Hint & Whisper, but needs your help. Asking {{#if invite.name}}{{invite.name.first}}{{else}}{{invite.email}}{{/if}} directly might seem a little awkward for them.</p><p>Would you register and invite {{#if invite.name}}{{invite.name.first}}{{else}}{{invite.email}}{{/if}} to sign up?</p><p>Hint & Whisper is the perfect middleman to let your loved ones know what you like, without being demanding or ruining the surprise. Just give us a whisper, we pass on the hints!!</p>',
        htmlText2: '<p>Thank you from {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}! </p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Register for a Hint & Whisper Account',
        buttonLink: '{{host}}/signup'
    },
		baseEmailTemplate: 'invites/invite_as_someoneElse',
    
  },

  'inviteConfirmAccountForSomeOneElse': { //ck read - A wants to invite B via SomeOneElse C and C not yet confirmed account- Email to C asking to confirm their account so as to Accept request as SomeoneElse
    subject: 'Help {{#if invite.name}}{{invite.name.first}}{{else}}{{invite.email}}{{/if}} join Hint & Whisper',
    email: {
        title: 'Hint & Whisper - Confirm Your Account',//here user is mediator
        salutation: 'Hi {{#if mediator.name}}{{mediator.name.first}}{{else}}{{mediator.email}}{{/if}}',
        image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/invitation.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} is on Hint & Whisper and wants you to get {{#if invite.name}}{{invite.name.first}}{{else}}{{invite.email}}{{/if}} signed up too! Hint & Whisper is the perfect middleman to help loved ones pass their secret gift preferences, without ruining the surprise.</p><p>Use the button below to <a href="{{host}}/confirm-account?email={{mediator.email}}&token={{mediator.confirmationToken}}&redirectTo=/{{signedUpFrom}}">confirm your account</a>, and we’ll send a Hint & Whisper invite from you to {{#if invite.name}}{{invite.name.first}}{{else}}{{invite.email}}{{/if}}. </p>',
        htmlText2: '<p>Then you can have your own fun and explore all the great features of Hint & Whisper, including our exclusive Hintlists and our vast selection of fine jewelry and accessories, brought to you by an extensive network of trusted jewelers from around the world.</p>',
        closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Invite Your Friend',
        buttonLink: '{{host}}/confirm-account?email={{mediator.email}}&token={{mediator.confirmationToken}}&redirectTo=/{{signedUpFrom}}'
    },
    baseEmailTemplate: 'invites/confirm_your_account_to_for_someoneElse'
    
  },
  
  'approveSomeoneElseInviteRequest':{ //ck read - A wants to invite B via someoneElse as C - Email to C seeking permission to accept to be that someoneElse
    subject: 'Please be my Hint & Whisper secret agent!',
    email: {
				title: 'Hint & Whisper - Invitation',
    		salutation: 'Hi {{#if mediator.name}}{{mediator.name.first}}{{else}}{{mediator.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/invitation.jpg',
        htmlText1: '<p>Would you invite {{#if invite.name}}{{invite.name}}{{else}}{{invite.email}}{{/if}} to Hint & Whisper for {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}?</p><p>Hint & Whisper is the perfect middleman to let our loved ones know what we like, without being demanding or ruining the surprise. {{#if user.name}}{{user.name}}{{else}}{{user.email}}{{/if}} really wants {{#if invite.name}}{{invite.name}}{{else}}{{invite.email}}{{/if}} on Hint and Whisper, but doesn’t want push.</p>',
        htmlText2: '<p>Thank you! You’re the Best! Just let {{#if user.name}}{{user.name}}{{else}}{{user.email}}{{/if}} know if you want to secretly invite someone too.</p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Invite {{#if invite.name}}{{invite.name}}{{else}}{{invite.email}}{{/if}} to sign up',
        //buttonLink: '{{host}}/invite/accept-someoneElse-invite?email={{#if invite.inviteeEmail}}{{invite.inviteeEmail}}{{else}}{{invite.email}}{{/if}}'
        buttonLink: '{{host}}/login'
    },
		baseEmailTemplate: 'invites/approve_for_someoneElse'
   },

  'notifyInviteJoin': { //ck read - A invited B - B signed up on HW and confirmed their account - Email to A in the form of a notification that B has joined HW
    subject: 'Your Hint & Whisper Invite has registered!',
    email: {
				title: 'Hint & Whisper - Invite has registered!',
				salutation: 'Hi {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/invitation.jpg',
        htmlText1: '<p>Great news! {{#if invite.name}}{{invite.name.first}}{{else}}{{invite.email}}{{/if}} has created an account on Hint & Whisper. Now you can share Hintlists, appoint Gatekeeper status, plan your romantic future, and much more! </p><p><a href="{{host}}/login">Log into your account to share or request Hintlist access now.</a> </p>',
				closing: 'Have Fun!',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Login To My Account',
				buttonLink: '{{host}}/login'
    },
		baseEmailTemplate: 'invites/notify_invite_join'
  },


// REQUEST  
  'requestAsSelf': { //ck read - A requests access for B's profile (A requests B) - Email to B informing that with a grant access button
		subject: '{{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}}  wants a peek at your Hintlist on Hint & Whisper.',
    email: {
				title: 'Hint & Whisper - Request Access',
    		salutation: 'Hi {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} has requested access to your Hint & Whisper Hintlist. </p><p>The people you share your Hintlist with can see your ring size, your preferences, and the personal hint ratings you save to your account. </p><p>Once you grant access, you won’t know when someone is looking or what they’re looking at, so drop all the hints you like and enjoy the surprise! </p><p>Use the button below to allow {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} to access your Hintlist. You can edit or remove access at any time. </p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Add {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} To My VIP List',
        // buttonLink: '{{host}}/request/approve?email={{requester.email}}&gatekeeper=false'
        buttonLink: '{{host}}/login'        
    },
		baseEmailTemplate: 'requests/request_as_self'
    
  },

  'approveBySelf': { //ck read - A requests B - B grants access to A - Email to A in the form of a notification that B has granted access
		subject: '{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} granted you Hintlist access! ',
    email: {
				title: 'Hint & Whisper - Access Granted',
    		salutation: 'Hi {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} has approved your request at Hint & Whisper! You now have access to view this Hintlist. Browse all you like - {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} won’t know when or what you look at – so the power to surprise is all yours. </p><p>You can use {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s  Hintlist to find the perfect gift, plan the perfect moment, and prepare for the perfect day. </p>',
        htmlText2: '<p>Create your own Hintlist to share, and tap into a wealth of information and support at Hint & Whisper, where everyone can get the gift and give the romance. </p>',        
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'View Hintlist',
        buttonLink: '{{host}}/users/{{user._id}}'
    },
    baseEmailTemplate: 'requests/approve_by_self'
    
  },  

  'requestAsHw': { //ck read - need redirects to work before this link will behave correctly - A requests B via HW option - Email to B informing that with a grant access button
		subject: 'Is your VIP list complete?',
    email: {
				title: 'Hint & Whisper - Update VIP List',
    		salutation: 'Hi {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>Your Hintlist gives your nearest and dearest the power to surprise you with the perfect gift. Make sure the ones who love you most aren’t missing out!</p><p>As always, you’re in complete control of who sees your profile. Use the button below to visit your Privacy Settings page to add or remove names on your VIP list. Keep your VIP list up to date to give the Hints they need for the gifts you’ll love. </p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Update My VIP List',
        buttonLink: '{{host}}/account/privacy'
    },
		baseEmailTemplate: 'requests/request_as_hw'

  },

  'requestAsSomeOneElse': { //ck - read - issues with the link and the text - A requests B via someoneElse option with C as someoneElse - Email to C informing that with a grant access button
		subject: 'Please be {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}}’s Hint & Whisper secret agent!',
    email: {
				title: 'Hint & Whisper - Request Access',
    		salutation: 'Hi {{#if mediator.name}}{{mediator.name.first}}{{else}}{{mediator.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>Would you ask {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} to add {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} on Hint & Whisper as a Hintlist VIP? {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} wants to see {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist, but would rather keep it casual. Just use the button below, and Hint & Whisper will do all the work!</p>',
        htmlText2: '<p>Thank you! Just let {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} know if you want a Hint & Whisper favor in return!</p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Send {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} a request to add VIPs',
        // buttonLink: '{{host}}/request/approve?email={{requester.email}}&someoneElse=true'
        buttonLink: '{{host}}/login'
    },
      baseEmailTemplate: 'requests/request_as_someoneElse'
    
  },

  'signupToSendAsSomeoneElse':{ //ck read - issues - A uses someoneElse to request B and C is someoneElse. C is however not registered. C is sent this email asking to signup in order to continue with the "as someoneElse" request process
		subject: 'Please help me out on Hint & Whisper!',
    email: {
				title: 'Hint & Whisper - Sign up to Request Access.',
    		salutation: 'Hi {{#if gatekeeper.name}}{{gatekeeper.name.first}}{{else}}{{gatekeeper.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} is on Hint & Whisper and {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} wants to see their Hintlist, but needs your help to keep it casual. </p><p>Hint & Whisper is the perfect middleman to let your loved ones know what you like, without being demanding or ruining the surprise. Would you help get {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}] to add {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} to the Hintlist VIPs? Then {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} can view {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s hints without it being too obvious. </p><p>Would you register and request access to {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist for {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}}?</p><p>Hint & Whisper will send the email, all you have to do is register so it can come from your account.  </p>',
        htmlText2: '<p>Let {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} know when you want a Hint & Whisper favor in return.</p>',
        closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Help {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} by Registering',
        buttonLink: '{{host}}/signup'
		},
		baseEmailTemplate: 'requests/signup_to_send_as_someoneElse'

	},

  'confirmToSendAsSomeoneElse': { //ck read - A uses someoneElse to request B and C is someoneElse. C is however not yet confirmed. C is sent this email asking to confirm their account/email in order to continue with the "as someoneElse" request process
    subject: '{{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} needs your help Hint & Whisper.',
    email: {
        title: 'Hint & Whisper - Confirm Account',
        salutation: 'Hi {{#if mediator.name}}{{mediator.name.first}}{{else}}{{mediator.email}}{{/if}}',
        image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} wants to be one of {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist VIPs, but wants the level of interest to seem less demanding. Would you do the asking? </p><p>Use the button below to confirm your account, and we’ll send out your friend’s request to be added to {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist VIPs like it was your idea.</p>',
        htmlText2: '<p>Then you can have your own fun and explore all the great features of Hint & Whisper, including our exclusive Hintlists and our vast selection of fine jewelry and accessories, brought to you by an extensive network of trusted jewelers from around the world.</p>',
        closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Help Friends Connect',
        // buttonLink: '{{host}}/request/approveconfirm/{{mediator.confirmationToken}}?user_email={{mediator.email}}&email={{requester.email}}&someoneElse=true&redirectTo=/{{signedUpFrom}}'
        buttonLink: '{{host}}/confirm-account?email={{mediator.email}}&token={{mediator.confirmationToken}}&redirectTo=/{{signedUpFrom}}'
    },  
      baseEmailTemplate: 'requests/confirm_your_account_to_send_as_someoneelse'
    
  },
  // confirmApproveToSendAsSomeoneElse :{
  //      subject: '{{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} needs your help Hint & Whisper.',
  //   email: {
  //       title: 'Hint & Whisper - Confirm Account',
  //       salutation: 'Hi {{#if mediator.name}}{{mediator.name.first}}{{else}}{{mediator.email}}{{/if}}',
  //       image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
  //       htmlText1: '<p>{{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} wants to be one of {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist VIPs, but wants the level of interest to seem less demanding. Would you do the asking? </p><p>Use the button below to confirm your account, and we’ll send out your friend’s request to be added to {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist VIPs like it was your idea.</p>',
  //       htmlText2: '<p>Then you can have your own fun and explore all the great features of Hint & Whisper, including our exclusive Hintlists and our vast selection of fine jewelry and accessories, brought to you by an extensive network of trusted jewelers from around the world.</p>',
  //       closing: 'Cheers',
  //       signature: 'The Hint & Whisper Team',
  //       buttonText: 'Help Friends Connect',
  //       buttonLink: '{{host}}/request/approveconfirm/{{mediator.confirmationToken}}?mediator={{mediator.email}}&email={{requester.email}}&someoneelse=true&redirectTo=/{{signedUpFrom}}'
  //   },
  //     baseEmailTemplate: 'requests/confirm_your_account_to_send_as_someoneelse'
  // },
  'requestAsSelfBySomeoneElse': { //ck read - A request to b via someoneElse C .After the approve request by C - Email to B  asking for  grant Access
    subject: 'Take another look at your VIPs on Hint & Whisper.',
    email: {
        title: 'Hint & Whisper - Manage VIP List',
        salutation: 'Hi {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}',
        image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if mediator.name}}{{mediator.name.first}}{{else}}{{mediator.email}}{{/if}} thinks you might have new info. Have you updated your Hintlist VIPs? Hint & Whisper takes the guesswork out of gift-giving without spoiling the surprise, so give your love a hint!</p><p> Don’t forget to add your newest squeeze, remove your ex, and keep your inner circle in on all the Hintlist goodies!</p>',
        htmlText2: '<p>You can browse and rate their extensive collection of jewelry and accessories from like to love to must have. Then check out your love’s Hintlist to pick out a longed-for treasure for the perfect gift, or gather clues for a brand-new discovery in the perfect style. Your love won’t know when you’re looking at hints, and you’ll never know what your love found, until the moment arrives! </p><p>At Hint and Whisper, couples get all the right gifts without saying a word.</p>',
        closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Issue a Request',
        // buttonLink: '{{host}}/request/approve?email={{mediator.email}}&someoneElse=false'
        buttonLink: '{{host}}/login' 
    },
      baseEmailTemplate: 'requests/request_as_self_by_someoneElse'
    
  },

  'requestAsGatekeeper':{ //ck read - A requests B via Gatekeeper option with C as Gatekeeper - Email to C to grant access
		subject: '{{#if gatekeeper.name}}{{gatekeeper.name.first}}{{else}}{{gatekeeper.email}}{{/if}}, {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} has requested access to {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hint & Whisper profile.',
    email: {
				title: 'Hint & Whisper - Request Access',
    		salutation: 'Hi {{gatekeeper.email}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} has requested access to view {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} ’s Hint & Whisper profile. As Gatekeeper, it is up to you to grant access on {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s behalf.</p><p>Use the button below to add {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} to {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s VIP list, or you can ignore this email. It’s up to you.</p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Add {{#if requester.name}}{{requester.name.first}}{{else}}{{requester.email}}{{/if}} to {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s VIP List',
        // buttonLink: '{{host}}/request/approve?email={{requester.email}}&gatekeeper=true'
        buttonLink: '{{host}}/login'
    },
    baseEmailTemplate: 'requests/request_to_gatekeeper'
    
  },

//VIP LIST

  'signupToAcceptGateKeeper': { //ck read - Email to ask user to signup on hw so as he/she has been added as a gatekeeper
		subject: 'Psst... You’re a Gatekeeper on Hint & Whisper',
    email: {
				title: 'Hint & Whisper - Psst... You’re a Gatekeeper',
    		salutation: 'Hi {{#if grantedUser.name}}{{grantedUser.name.first}}{{else}}{{grantedUser.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} has appointed you as a Gatekeeper on Hint & Whisper, the go-to spot for all things jewelry, engagements, and weddings. </p><p>As a Gatekeeper, you are the guardian of {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist. Help your friend plan and dream, and when the time is right, secretly share your friend’s Hintlist with her special someone. </p><p>Ready to start helping {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} make her dream romance real? Create your Hint & Whisper account and dive in!</p>',
        htmlText2: '<p>Have fun!</p>',        
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Join Hint & Whisper',
        buttonLink: '{{host}}/signup'
    },
		baseEmailTemplate: 'privacies/signup_to_accept_gatekeeper'
    
  },
  

  'grantGateKeeperAccess': { //ck read - An email is sent as a form of notification to the gatekeeper saying that A has added him/her as a gatekeeper to their profile
    subject: '{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} appointed you as a gatekeeper',
    email: {
				title: 'Hint & Whisper - Gatekeeper Access Granted',
				salutation: 'Hi {{#if grantedUser.name}}{{grantedUser.name.first}}{{else}}{{grantedUser.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} has appointed you as a Gatekeeper on Hint & Whisper, the go-to spot for all things jewelry, engagements, and romance.</p><p>As a Gatekeeper, you are the guardian of {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist. Help your friend plan and dream, and when the time is right, secretly share your friend’s Hintlist with her special someone. </p><p>Gatekeeper status has been added to your Hint & Whisper profile. Check out {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist and start helping make her dreams come true! </p>',
        htmlText2: 'Have fun!',        
				closing: '',
        signature: 'The Hint & Whisper Team',
        buttonText: 'View {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist',
				buttonLink: '{{host}}/users/{{user._id}}',
				buttonLink: '{{host}}/login'
    },
		baseEmailTemplate: 'privacies/grant_gatekeeper_access'
  },

  'grantAccess': { //ck read - When a user add a person to their VIP list (either regular VIP or Gatekeeper) - then this email goes out. Does not have anything to do with the invite/request process (only direct entry on privacy page)
		subject: '{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} granted you Hintlist access! ',
    email: {
				title: 'Hint & Whisper - Access Granted',
    		salutation: 'Hi {{#if grantedUser.name}}{{grantedUser.name.first}}{{else}}{{grantedUser.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}, has added you to their Hint & Whisper VIP list! You now have access to view this Hintlist to get the latest scoop on all of {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s favorite styles. Browse all you like - {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} won’t know when or what you look at – so the power to surprise is all yours. </p><p>You can use {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist to help find the perfect gift, plan the perfect moment, and prepare for the perfect day. </p>',
        htmlText2: '<p>Create your own Hintlist to share, and tap into a wealth of information and support at Hint & Whisper, where everyone can get the gift and give the romance. </p>',        
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'View {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist',
        buttonLink: '{{host}}/users/{{user._id}}'
    },
      baseEmailTemplate: 'privacies/grant_access'

  },

  'confirmAccountToAcceptGatekeeper': { //ck read - A adds B as gatekeeper. B is not a confirmed user. Email is sent to B asking to confirm his account
    subject: '{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} added you as a Gatekeeper - please confirm your email address.',
    email: {
				title: 'Hint & Whisper - Confirm Your Account',
    		salutation: 'Hi {{#if grantedUser.name}}{{grantedUser.name.first}}{{else}}{{grantedUser.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} has appointed you as a Gatekeeper on Hint & Whisper. This makes you the guardian of {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist, with the power to share it with the people that matter most! </p><p>We just need you to <a href="{{host}}/confirm-account?email={{gatekeeper.email}}&token={{gatekeeper.confirmationToken}}">confirm your email address</a> to finish registering you to be Gatekeeper. Use the button below to confirm your email address, and help make {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s romantic dreams come true. </p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Confirm My Email Address',
        buttonLink: '{{host}}/confirm-account?email={{grantedUser.email}}&token={{grantedUser.confirmationToken}}&&redirectTo=/{{signedUpFrom}}'
    },
		baseEmailTemplate: 'privacies/confirm_your_account_to_accept_gatekeeper'
    
  },


//MISC

  'shareHintlist' : { //ck read - One can share his/her hintlist with others by sending an email which would consist of a Link to the PDF
    subject: '{{subject}} ',
    email: {
				title: 'Hint & Whisper - {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} sent you a Hint! ',
				salutation: 'Hi {{to}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/img-center.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{user.name.last}}{{else}}{{user.email}}{{/if}} is sharing secrets with you from Hint & Whisper. </p><p>The Hint & Whisper community supports old-fashioned romance by giving the element of surprise a helping hand.</p><p>You can use {{#if user.name}}{{user.name.first}}{{user.name.last}}{{else}}{{user.email}}{{/if}}s  Hintlist to find the perfect gift, plan the perfect moment, and prepare for the perfect day. </p>',
        htmlText2: '<p>Join Hint & Whisper to create your own Hintlist, request full profile access, and tap into a wealth of information and support to bring your romantic future to fruition. </p>',        
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'View {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} Hintlist PDF',
				buttonLink: '{{hintlistLink}}'
    },
    baseEmailTemplate: 'commons/share_hintlist'
  },


// The below are not yet setup

  'inviteAsBrand':{ //on hold for now
      subject: 'not set up yet',
      baseEmailTemplate: 'invites/invite_as_brand',
      email: {
          text: 'Hi Please confirm your account with us',
          signature: 'The Hint & Whisper Team',
          buttonText: 'Signup'
      }
  },

  'requestAsBrand': { //A requests B via Brand option - Email to B informing that with a grant access button
      subject: 'not set up yet',
      baseEmailTemplate: 'requests/request_as_brand',
      email: {
        text: 'Hi Please confirm your account with us',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Approve'
    },
  },

  'retailerAppointment': { //This one consists time and date for appointment - user info as above
    subject: 'not set up yet',
    email: {
				title: '',
				salutation: 'Hi {{user.name.first}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/img-center.jpg',
        htmlText1: '',
				closing: '',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Log Into My Account',
				buttonLink: '{{host}}/login'
    },
      baseEmailTemplate: 'appointment/retailer_appointment'
  },
  

  'retailerContact': { //User can contact a retailer directly with a message that user has added along with the details in teh form such as phone no
      subject: 'not set up yet',
      baseEmailTemplate: 'contact/retailer',
      email: {
        text: 'Hi Please confirm your account with us',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Confirm your account'
     }
    },
  
  

//The below are not really in use as per some requirement changes


  'confirmAccountToProcessRequest': { //A requests B - A has not confirmed account - Email to A asking to confirm their account so as to process all the requests
    subject: 'Your Hints are waiting! Confirm your email address at Hint & Whisper.',
    email: {
				title: 'Confirm Your Hint & Whisper Account',
    		salutation: 'Hi {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}',
				image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>Thank you for registering at Hint & Whisper. Welcome to our growing community of friends helping to give romance a little boost!  </p><p>Use the button below to <a href="{{host}}/confirm-account?email={{user.email}}&token={{user.confirmationToken}}&redirectTo=/{{signedUpFrom}}">confirm your email address</a>, and we’ll send your Share Request right away. </p>',
				closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Confirm My Email Address',
        buttonLink: '{{host}}/confirm-account?email={{user.email}}&token={{user.confirmationToken}}&redirectTo=/{{signedUpFrom}}'
    },
      baseEmailTemplate: 'requests/confirm_your_account_to_process_request'
    
  },

  'signupToSendRequest': { //A requests B - A has not signed up - Email to A asking to signup so as to process all the requests
    subject: 'Signup to request access',
    baseEmailTemplate: 'requests/signup_to_send_request',
    email: {
        text: 'Hi Please confirm your account with us',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Confirm your account'
    },
  },
  'signupToAcceptVIP':{//ck read - A adds B as VIP user without gatekeepr. B is not registered user. Email is sent to B asking to register 
    subject: 'Psst... You’re a VIP user on Hint & Whisper',
    email: {
        title: 'Hint & Whisper - Psst... You’re a Gatekeeper',
        salutation: 'Hi {{#if grantedUser.name}}{{grantedUser.name.first}}{{else}}{{grantedUser.email}}{{/if}}',
        image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} has appointed you as a Gatekeeper on Hint & Whisper, the go-to spot for all things jewelry, engagements, and weddings. </p><p>As a Gatekeeper, you are the guardian of {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist. Help your friend plan and dream, and when the time is right, secretly share your friend’s Hintlist with her special someone. </p><p>Ready to start helping {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} make her dream romance real? Create your Hint & Whisper account and dive in!</p>',
        htmlText2: '<p>Have fun!</p>',        
        closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Join Hint & Whisper',
        buttonLink: '{{host}}/signup'
    },
    baseEmailTemplate: 'privacies/signup_to_accept_vip'
    
  },
  'confirmAccountToAcceptVIP': { //ck read - A adds B as VIP user without gatekeepr. B is not a confirmed user. Email is sent to B asking to confirm his account
    subject: '{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} added you as a VIP user - please confirm your email address.',
    email: {
        title: 'Hint & Whisper - Confirm Your Account',
        salutation: 'Hi {{#if grantedUser.name}}{{grantedUser.name.first}}{{else}}{{grantedUser.email}}{{/if}}',
        image: 'https://cdn.optcentral.com/hw/0/email_transactions/img/vertical-keys.jpg',
        htmlText1: '<p>{{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}} has appointed you as a VIP user on Hint & Whisper. This makes you the guardian of {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s Hintlist, with the power to share it with the people that matter most! </p><p>We just need you to <a href="{{host}}/confirm-account?email={{gatekeeper.email}}&token={{gatekeeper.confirmationToken}}">confirm your email address</a> to finish registering you to be Gatekeeper. Use the button below to confirm your email address, and help make {{#if user.name}}{{user.name.first}}{{else}}{{user.email}}{{/if}}’s romantic dreams come true. </p>',
        closing: 'Cheers',
        signature: 'The Hint & Whisper Team',
        buttonText: 'Confirm My Email Address',
        buttonLink: '{{host}}/confirm-account?email={{grantedUser.email}}&token={{grantedUser.confirmationToken}}&&redirectTo=/{{signedUpFrom}}'
    },
    baseEmailTemplate: 'privacies/confirm_your_account_to_accept_vip'  
  }
}



var MonqEmail = function (app, params, emailtype) {
  //emailtype means type of email like confirmAccount,requestAsSomeOneElse
  this.params = params;
  
  this.typeobject = emailTypeObject[emailtype];
  //params email
  if (this.typeobject && this.typeobject.email) {
    this.params.email = this.typeobject.email;
  }
  // params partials
  // if (this.typeobject && this.typeobject.partials){
  //   this.params.partials = this.typeobject.partials;
  // }
  this.params.partials = partialKeys
  this.from = app.config.sendgrid.sender;
  this.app = app;
  this.emailtype = emailtype
}

MonqEmail.prototype.sendDirectEmail = function(to, callback){
  console.log("@@@@Email Type@@@@@:" + this.emailtype)
  if (!this.typeobject) {
    callback({errors:["Email type "+this.emailtype+ "doesn't exists"]})
  } else {
    this.app.monq.sendEmail({
      to: to,
      from: this.from,
      subject: this.typeobject.subject,
      template: {
        params: this.params
      },
      baseEmailTemplate: this.typeobject.baseEmailTemplate,
    }
    , function(err) {
      if (err) {
        callback(err);
      } else {
        console.log('@@@@@@@@@Email added to sendgrid jobs@@@@@@@@@@ '+to);
        callback(null,"Success")  
      }
    }); 
  }
}

MonqEmail.prototype.sendEmail = function(to, callback){
  console.log("@@@@Email Type@@@@@:" + this.emailtype)
  if (!this.typeobject) {
    callback({errors:["Email type "+this.emailtype+ "doesn't exists"]})
  } else {

    console.log('Email sent directly.');

    var emailInfo = {
      to: to,
      from: this.from,
      subject: this.typeobject.subject,
      template: {
        params: this.params
      },
      baseEmailTemplate: this.typeobject.baseEmailTemplate
    };

    var workers = require('../workers')(this.app);

    workers.email(emailInfo
    , function(err) {
      if (err) {
        callback(err);
      } else {
        console.log('@@@@@@@@@Email sent directly@@@@@@@@@@ '+to);
        callback(null,"Success")  
      }
    });
    
  }
}


  
module.exports = MonqEmail;
