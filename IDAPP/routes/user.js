/*
 * For the Infrastructure API, all the response will be given in JSON format.
 */
 
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('../IDAPP/views/index.ejs');
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // Esta ruta no va a mostrar vista para los usuarios finales al menos que sea interno de la empres
    app.get('/login', function(req, res) {

        res.render('../IDAPP/views/login.ejs', { message: req.flash('loginMessage') });
    });



    // process the login form
    app.post('/login', function(req, res,next) {
      passport.authenticate('local-login', function(err, user, info) {

        req.login(user, function(err) {
          if (err) { return next(err); }
            return res.json({'err':err,'user':user,'info':info, 'isLoggedIn':'1'});
        });


      })(req, res, next);
    });


    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
      res.render('../IDAPP/views/signup.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/signup', function(req, res,next) {
      passport.authenticate('local-signup', function(err, user, info) {
        return res.json({'err':err,'user':user,'info':info});

      })(req, res, next);
    });


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.json({ code : '200', message: 'Sesion terminada' });
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    return res.json({ code : '-5000', message: 'Debes iniciar sesion para ingresar' });
}
