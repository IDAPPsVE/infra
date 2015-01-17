/*
 * For the Infrastructure API, all the response will be given in JSON format.
 */
 
var email = require('../controllers/mailController');
var Validacion  = require('../models/ValidacionBox');
var Contratos   = require('../models/Contratos');
var rs = require('../helpers/randomString');

module.exports = function(app, passport) {
    // ================================================
    //              Pagina Public IDAPP
    // ================================================
    app.get('/', function(req, res) {
        res.render('../IDAPP/views/index.ejs');
    });

    // ================================================
    //  Sistema de accesos segun niveles de seguridad
    // ================================================
    
    //Ingreso del propietario de la app, este sera redirigido al dashboard como superusuario de su aplicacion. 
    app.get('/login', function(req, res) {

        res.render('../IDAPP/views/login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/login', function(req, res,next) {
      passport.authenticate('local-loginAdminSys', function(err, user, info) {

        var userNeededData = {'id':user._id,
                              'Email':user.Email,
                              'Tipo':user.Tipo,
                              'isLoggedIn':'1'};
        req.login(userNeededData, function(err) {
          if (err) { return next(err); }

            if(user.Tipo == 4)
              {
                //Redirigir a donde debe
                res.redirect('/admin/dashboard');
              }
        });
      })(req, res, next);
    });

    app.get('/signup', function(req, res) {
      res.render('../IDAPP/views/signup.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/signup', function(req, res,next) {
      passport.authenticate('local-loginAdminSys', function(err, user, info) {
        var randomString = rs.randomString(20);
        guardarCodigoValidacion(user._id, randomString);
        email.sendValidationCode(user.Email,randomString);
        
        return res.json({'err':err,'user':user,'info':info});

      })(req, res, next);
    });
    
    
    //Ingreso para los empleados del 
    app.get('/ias/staff/login', function(req, res) {

        //res.render('../IDAPP/views/login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/ias/staff/login', function(req, res,next) {
      passport.authenticate('local-loginIDAPPEmpleado', function(err, user, info) {

        var userNeededData = {'id':user._id,
                              'Email':user.Email,
                              'Tipo':user.Tipo,
                              'isLoggedIn':'1'};
        req.login(userNeededData, function(err) {
          if (err) { return next(err); }
          
            if(user.Tipo == 3)
              {
                //Redirigir a donde debe
                res.redirect('/admin/dashboard');
              }
        });
      })(req, res, next);
    });
    
    app.get('/ias/staff/signup', function(req, res) {
      res.render('../IDAPP/views/signup.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/ias/staff/signup', function(req, res,next) {
      passport.authenticate('local-loginIDAPPEmpleado', function(err, user, info) {
        var randomString = rs.randomString(20);
        guardarCodigoValidacion(user._id, randomString);
        email.sendValidationCode(user.Email,randomString);
        
        return res.json({'err':err,'user':user,'info':info});

      })(req, res, next);
    });
    
    //Ingreso de los administradores de IDAPP
    app.get('/ias/admin/login', function(req, res) {

        //res.render('../IDAPP/views/login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/ias/admin/login', function(req, res,next) {
      passport.authenticate('local-loginIDAPP', function(err, user, info) {

        var userNeededData = {'id':user._id,
                              'Email':user.Email,
                              'Tipo':user.Tipo,
                              'isLoggedIn':'1'};
        req.login(userNeededData, function(err) {
          if (err) { return next(err); }
          
            if(user.Tipo == 2)
              {
                //Redirigir a donde debe
                res.redirect('/admin/dashboard');
              }
        });
      })(req, res, next);
    });
  
    app.get('/ias/admin/signup', function(req, res) {
      res.render('../IDAPP/views/signup.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/ias/admin/signup', function(req, res,next) {
      passport.authenticate('local-signupIDAPP', function(err, user, info) {
        var randomString = rs.randomString(20);
        guardarCodigoValidacion(user._id, randomString);
        email.sendValidationCode(user.Email,randomString);
        
        return res.json({'err':err,'user':user,'info':info});

      })(req, res, next);
    });
    
    //Ingreso ICARUS
    app.get('/ias/ss/login', function(req, res) {

        //res.render('../IDAPP/views/login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/ias/ss/login', function(req, res,next) {
      passport.authenticate('local-loginICARUS', function(err, user, info) {

        var userNeededData = {'id':user._id,
                              'Email':user.Email,
                              'Tipo':user.Tipo,
                              'isLoggedIn':'1'};
        req.login(userNeededData, function(err) {
          if (err) { return next(err); }
          
            if(user.Tipo == 1)
              {
                //Redirigir a donde debe
                res.redirect('/admin/dashboard');
              }
        });
      })(req, res, next);
    });

    app.get('/ias/ss/signup', function(req, res) {
      res.render('../IDAPP/views/signup.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/ias/ss/signup', function(req, res,next) {
      passport.authenticate('local-signupICARUS', function(err, user, info) {
        var randomString = rs.randomString(20);
        guardarCodigoValidacion(user._id, randomString);
        email.sendValidationCode(user.Email,randomString);
        
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

function guardarCodigoValidacion(id,validacion)
{
  var v = new Validacion(); 		// create a new instance of the Bear model
  v.user_id = id;
  v.Validacion = validacion;
  // save the bear and check for errors
  v.save(function(err) {});
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    return res.json({ code : '-5000', message: 'Debes iniciar sesion para ingresar' });
}
