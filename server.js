// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 15454;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

//var Usuario            = require('./IDAPP/models/user');

var configDB = require('./IDAPP/config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

var router = express.Router();

require('./IDAPP/config/passport.js')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

    // required for passport
app.use(session({
  secret: 'TheSuperPowerfulSessionKey',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1800000, //previously set to just 1800 - which was too low
    httpOnly: true
  }
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./IDAPP/routes/user.js')(router, passport); // load our routes and pass in our app and fully configured passport
require('./IDAPP/routes/infra.js')(router);
require('./HUB/Boxes/routes.js')(router);
require('./HUB/MaraBox/routes.js')(router, passport);

app.use('/', router);


// launch ======================================================================
app.listen(port);
