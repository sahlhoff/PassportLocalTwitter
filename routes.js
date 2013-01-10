var passport = require('passport')
	, User = require('./models/user') 


module.exports = function (app){

	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/')
	}


//------------------Index-----------------------

	app.get('/', function (req, res) {
		res.render('index', {
								title: 'Sign up with Twiiter'
							});
	})


	app.get('/logout', function (req, res){
	  req.logout();
	  res.redirect('/');
	});

//-------------------Login------------------------

	app.get('/login', function (req, res) {
		res.render('login', {
								title: 'Login'
							});
	});

	app.post('/login', passport.authenticate('local'), 
		function (req, res) {
			var accessToken;
			User.findOne({ userId: req.user, pass: req.body.password}, function (err, doc){
				if(err){
						console.log(err);
						res.redirect('/login')
					}
				if(doc){
					accessToken = doc.accessToken;
					req.session.accessToken = accessToken;
					req.session.userId = req.user;

					res.redirect('/account')
				}			
			});
	});

//--------------------Signup-----------------------

	app.get('/signup', ensureAuthenticated, function (req, res) {
		res.render('signup', {
								title: 'Signup'
							});
	})

	app.post('/signup', function (req, res) {

		console.log('user = ' + req.user.id);
		handle = req.body.handle;
		pass = req.body.password1;
		email = req.body.email;

		User.findOne({userId: req.user.id}, function (err, doc) {
			if(err){
					console.log(err);
					res.redirect('/');
				}
			else {
				doc.handle = handle;
		  		doc.pass = pass;
		  		doc.email = email;
		  		doc.save();

		  		res.redirect('/account');
			}
		})

	})

//--------------------Oauth--------------------------


app.get('/auth/twitter',
  passport.authenticate('twitter'));


app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/signup');
  });


//--------------------Account----------------------------


app.get('/account', ensureAuthenticated, function(req, res) {
	res.render('account');
})

}