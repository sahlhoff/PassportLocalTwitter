var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , User = require('./models/user')
  , config = require('./config')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy;


var TWITTER_CONSUMER_KEY = config.secrets.clientId
var TWITTER_CONSUMER_SECRET = config.secrets.clientSecret
var CALLBACK = config.secrets.redirectUrl


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});



passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: CALLBACK
  },
  function(token, tokenSecret, profile, done) {
      process.nextTick(function () {
          User.findOne({userId : profile.id }, function(err, existingUser) {
            if (err || existingUser) {
                return done(err, profile.id);
            }

            var user = new User({ 
                  accessToken : tokenSecret
                , userId : profile.id
            });

            user.save(function(err) {
                if (err) {
                    console.log(err);
                }
            });
          }); 
        });
      return done(null, profile);
    }
  ));



passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ handle: username, pass: password }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      return done(null, user.userId);
    });
  }
));


var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'sahlhoff' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function(){
    app.use(express.errorHandler());
});


mongoose.connect('mongodb://localhost/passporttwitter');



// Setup routes
require('./routes')(app);




http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
