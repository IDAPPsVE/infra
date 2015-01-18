var Contratos   = require('../models/Contratos');
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var UsuarioInfra            = require('../models/UsuariosInfra');
var UsuarioIDAPP            = require('../models/UsuariosIDAPP');
var UsuarioCliente            = require('../models/UsuariosClientes');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // Registro y Sesion ICARUS
    // =========================================================================
    passport.use('local-signupICARUS', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        UsuarioInfra.findOne({ 'IDAPP.Email' :  email }, function(err, usuario) {

            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (verificarValidezContrato(req.body.contrato)){
              return done(null, false, { code : '-5000', message: 'El Código del contrato ya está registrado' });
            } else if (usuario) {
              return done(null, false, { code : '-5000', message: 'El correo electrónico ingresado ya está registrado' });
            } else {

                // if there is no user with that email
                // create the user

                var newUser            = new UsuarioInfra();

                // set the user's local credentials
                newUser.IDAPP.Email    = email;
                newUser.IDAPP.Tipo     = 1;
                newUser.IDAPP.Password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                      {
                        throw err;
                      }
                    return done(null, newUser, { code : '200'});
                });
            }
        });
        });
    }));
    
    // =========================================================================
    // Registro y Sesion admin IDAPP
    // =========================================================================
    passport.use('local-signupIDAPP', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {


        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        UsuarioInfra.findOne({ 'IDAPP.Email' :  email }, function(err, usuario) {

          // if there are any errors, return the error
          if (err)
            return done(err);

            // check to see if theres already a user with that email
            if (usuario) {
              return done(null, false, { code : '-5000', message: 'El correo electrónico ingresado ya está registrado' });
            } else {

              // if there is no user with that email
              // create the user

              var newUser            = new UsuarioInfra();

              // set the user's local credential
              newUser.IDAPP.Email    = "vjfs18@gmail.com";
              newUser.IDAPP.Tipo     = 2;
              newUser.IDAPP.Password = newUser.generateHash("IDAPP");

              // save the user
              newUser.save(function(err) {
                if (err)
                  {
                    throw err;
                  }
                  return done(null, newUser, { code : '200'});
                });
              }
            });
          });
        }));
        
    // =========================================================================
    // Registro y Sesion empleados IDAPP
    // =========================================================================
      passport.use('local-signupIDAPPEmpleado', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {


        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        UsuarioIDAPP.findOne({ 'IDAPP.Email' :  email }, function(err, usuario) {

          // if there are any errors, return the error
          if (err)
            return done(err);

            // check to see if theres already a user with that email
            if (usuario) {
              return done(null, false, { code : '-5000', message: 'El correo electrónico ingresado ya está registrado' });
            } else {

              // if there is no user with that email
              // create the user

              var newUser            = new UsuarioIDAPP();

              // set the user's local credential
              newUser.IDAPP.Email    = email;
              newUser.IDAPP.Tipo     = 3;
              newUser.IDAPP.Password = newUser.generateHash(password);

              // save the user
              newUser.save(function(err) {
                if (err)
                  {
                    throw err;
                  }
                  return done(null, newUser, { code : '200'});
                });
              }
            });
          });
        }));
        
    // =========================================================================
    // Registro y Sesion Cliente Admin Superusuario
    // =========================================================================
    passport.use('local-signupAdminSys', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {


        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        UsuarioCliente.findOne({ 'IDAPP.Email' :  email }, function(err, usuario) {

          // if there are any errors, return the error
          if (err)
            return done(err);

            // check to see if theres already a user with that email
            if (usuario) {
              return done(null, false, { code : '-5000', message: 'El correo electrónico ingresado ya está registrado' });
            } else {

              // if there is no user with that email
              // create the user
              var newUser            = new UsuarioCliente();

              // set the user's local credentials
              newUser.IDAPP.Contrato = req.body.contrato;
              newUser.IDAPP.Email    = email;
              newUser.IDAPP.Tipo     = 4;
              newUser.IDAPP.Password = newUser.generateHash(password);

              // save the user
              newUser.save(function(err) {
                if (err)
                  {
                    throw err;
                  }
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
      done(null, usuario);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      UsuarioInfra.findById(id.id, function(err, usuario) {
          done(err, usuario);
      });
    });

    passport.use('local-loginICARUS', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        UsuarioInfra.findOne({ 'Email' :  email }, function(err, usuario) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (usuario.Email != email)
              return done(null, false, { code : '-5000', message: 'Usuario no registrado' });

            // if the user is found but the password is wrong
            if (!usuario.validPassword(password))
                return done(null, false, { code : '-2000', message: 'Password errado' });

            // all is well, return successful user
            return done(null, usuario,{ code : '200' });


        });

    }));
    
    passport.use('local-loginIDAPP', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        UsuarioInfra.findOne({ 'Email' :  email }, function(err, usuario) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (usuario.Email != email)
              return done(null, false, { code : '-5000', message: 'Usuario no registrado' });

            // if the user is found but the password is wrong
            if (!usuario.validPassword(password))
                return done(null, false, { code : '-2000', message: 'Password errado' });

            // all is well, return successful user
            return done(null, usuario,{ code : '200' });
        });
    }));
    
    passport.use('local-loginIDAPPEmpleado', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        UsuarioIDAPP.findOne({ 'Email' :  email }, function(err, usuario) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (usuario.Email != email)
              return done(null, false, { code : '-5000', message: 'Usuario no registrado' });

            // if the user is found but the password is wrong
            if (!usuario.validPassword(password))
                return done(null, false, { code : '-2000', message: 'Password errado' });

            // all is well, return successful user
            return done(null, usuario,{ code : '200' });
        });
    }));
    
    passport.use('local-loginAdminSys', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        UsuarioCliente.findOne({ 'Email' :  email }, function(err, usuario) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (usuario.Email != email)
              return done(null, false, { code : '-5000', message: 'Usuario no registrado' });

            // if the user is found but the password is wrong
            if (!usuario.validPassword(password))
                return done(null, false, { code : '-2000', message: 'Password errado' });

            // all is well, return successful user
            return done(null, usuario,{ code : '200' });
        });
    }));

};

function verificarValidezContrato(contrato)
{
  Contratos.findOne({ 'Contrato' :  contrato }, function(err, c) {

    // if there are any errors, return the error
    if (err)
    {
      return done(err);
    }
      if(c)
      {
        return true;
      }
      else
      {
        return false;
      }
    });
}

function verificarVariablesConIDAPP(){
  
}
