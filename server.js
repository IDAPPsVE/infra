// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');

//call Models
var User = require('./app/models/user');

// Connect to a Mongolab database
mongoose.connect('mongodb://idapp-develop:IDAPP-Javier-Carlos@ds051160.mongolab.com:51160/idapp');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// route middleware that will happen on every request
router.use(function(req, res, next) {
	// log each request to the console
	console.log(req.method, req.url);

	// continue doing what we were doing and go to the route
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// route middleware to validate :name
router.param('name', function(req, res, next, name) {
	// do validation on name here
	// blah blah validation
	// log something so we know its working
	console.log('doing name validations on ' + name);

	// once validation is done save the new item in the req
	req.name = name;
	// go to the next thing
	next();
});
// test rout with parameters
router.get('/hello/:name', function(req, res) {
	res.send('hello ' + req.params.name + '!');
});
// more routes for our API will happen here




router.route('/user')

	// create a bear (accessed at POST http://localhost:8080/api/bears)
	.post(function(req, res) {

		var bear = new User(); 		// create a new instance of the Bear model
		bear.name = req.body.name;  // set the bears name (comes from the request)

		// save the bear and check for errors
		bear.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'User created!' });
		});

	})

    // get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		User.find(function(err, usuario) {
			if (err)
				res.send(err);

			res.json(usuario);
		});

	});

router.route('/user/:usuario_id')

	// get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
	.get(function(req, res) {
		User.findById(req.params.usuario_id, function(err, usuario) {
			if (err)
				res.send(err);
			res.json(usuario);
		});
	})

  .put(function(req, res) {

		// use our bear model to find the bear we want
		User.findById(req.params.usuario_id, function(err, usuario) {

			if (err)
				res.send(err);

			usuario.name = req.body.name; 	// update the bears info

			// save the bear
			usuario.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Usuario updated!' });
			});

		});
	})

  .delete(function(req, res) {
		User.remove({
			_id: req.params.usuario_id
		}, function(err, usuario) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//With this it is possible to group the routs by its logic differences
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
