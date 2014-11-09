// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var Usuario            = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'Email',
        passwordField : 'Password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {


        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        Usuario.findOne({ 'local.Email' :  email }, function(err, usuario) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (usuario) {
              console.log({ code : '-5000', message: 'El correo electrónico ingresado ya estánregistrado' });
              return done(null, false, { code : '-5000', message: 'El correo electrónico ingresado ya estánregistrado' });
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new Usuario();

                // set the user's local credentials
                newUser.local.Email    = email;
                newUser.local.Password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                      {
                        throw err;
                      }
                    console.log({ code : '200'});
                    return done(null, newUser, { code : '200'});
                });
            }

        });

        });

    }));


     // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(usuario, done) {
      done(null, Usuario.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      Usuario.findById(id, function(err, usuario) {
          done(err, user);
      });
    });

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'Email',
        passwordField : 'Password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        Usuario.findOne({ 'local.Email' :  email }, function(err, usuario) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (usuario.local.Email != email)
              return done(null, false, { code : '-5000', message: 'Usuario no registrado' });

            // if the user is found but the password is wrong
            if (!usuario.validPassword(password))
                return done(null, false, { code : '-2000', message: 'Password errado' });

            // all is well, return successful user
            return done(null, Usuario,{ code : '200' });
        });

    }));

};
