var Validacion  = require('./models/ValidacionUsuario');
var rs = require('../helpers/randomString');
var email = require('../controllers/mailController');

module.exports = function(app,passport) {
    app.get('/MaraBox/', function(req, res) {
        res.json({ message: 'MaraBox' });
    });
    
    app.get('/MaraBox/atletas/:id', function(req, res) {
      res.json({ message: 'MaraBox ' + req.params.id });
    });
    
    app.get('/MaraBox/admin/registroNuevoUsuario', function(req, res) {

    });
    
    app.post('/MaraBox/admin/registroNuevoUsuario', function(req, res) {

    });
    
    app.get('/MaraBox/admin/nuevoWod', function(req, res) {

    });
    
    app.post('/MaraBox/admin/nuevoWod', function(req, res) {

    });
    
    app.get('/MaraBox/admin/nuevaNotificacion', function(req, res) {

    });
    
    app.post('/MaraBox/admin/nuevaNotificacion', function(req, res) {

    });
    
    app.get('/MaraBox/admin/:fecha', function(req, res) {

    });
    
    app.get('/MaraBox/admin/:fecha/:hora', function(req, res) {

    });
    
    app.get('/MaraBox/admin/:fecha/:hora/registroAsistencia', function(req, res) {

    });
    
    app.post('/MaraBox/admin/:fecha/:hora/registroAsistencia', function(req, res) {

    });
    
    app.get('/MaraBox/admin/atletas', function(req, res) {

    });
    
    app.get('/MaraBox/admin/atletas/:id', function(req, res) {

    });
    
    
    
    //////////////////////////////////////////////////////
    // API
    //////////////////////////////////////////////////////
    app.post('/MaraBox/signup', function(req, res,next) {
      passport.authenticate('local-signupMaraBox', function(err, user, info) {
        var randomString = rs.randomString(10);
        guardarCodigoValidacion(user._id, randomString);
        email.sendValidationCodeMaraBox(user.Email,randomString);
        
        return res.json({'err':err,'user':user,'info':info});

      })(req, res, next);
    });
    
    app.post('/MaraBox/login', function(req, res,next) {
      passport.authenticate('local-loginMarabox', function(err, user, info) {

        var userNeededData = {'id':user._id,
                              'Email':user.Email,
                              'Tipo':user.Tipo,
                              'isLoggedIn':'1'};
        req.login(userNeededData, function(err) {
          if (err) { return next(err); }
          
          console.log(req.session, req.headers['x-access-token']);

            if(user.Tipo == 10)
            {
              return res.json({'err':err,'data':userNeededData});
            }
        });
      })(req, res, next);
    });
    
    app.get('/MaraBox/logout', function(req, res) {
        req.logout();
        res.json({ code : '200', message: 'Sesion terminada' });
    });
    app.post('/MaraBox/uploadUserPic', function(req, res) {

    });
    app.get('/MaraBox/getUserPic', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });
    app.post('/MaraBox/asistencia', function(req, res) {

    });
    app.post('/MaraBox/:evento/asistir', function(req, res) {

    });
    app.post('/MaraBox/registroRM', function(req, res) {

    });
    app.get('/MaraBox/progreso', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });
    app.get('/MaraBox/:idEjercicio', function(req, res) {
        res.json({ message: req.params.idEjercicio });
    });
    app.get('/MaraBox/ejercicios', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });
    app.get('/MaraBox/WOD/:fecha', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });
    app.get('/MaraBox/eventos', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });
    
    /*app.post('/login', function(req, res,next) {
      passport.authenticate('local-login', function(err, user, info) {

        var userNeededData = {'id':user._id,
                              'Email':user.Email,
                              'Tipo':user.Tipo,
                              'isLoggedIn':'1'};
        req.login(userNeededData, function(err) {
          if (err) { return next(err); }
            //return res.json({'err':err,'user':userNeededData,'info':info});
            if((user.Tipo == 1) || (user.Tipo == 2))
              {
                res.redirect('/admin/dashboard');
              }

            if(user.Tipo == 10)
            {
              res.redirect('/dashboard');
            }

        });


      })(req, res, next);
    });
    app.post('/contacto',function(req, res) {

      var contacto = new Contacto(); 		// create a new instance of the Bear model
      contacto.Nombre = req.body.nombre;
      contacto.Apellido = req.body.apellido;
      contacto.Email = req.body.email;
      contacto.Mensaje = req.body.mensaje;
      contacto.Fecha = new Date();

      // save the bear and check for errors
      contacto.save(function(err) {
        if (err)
          res.render('../IDAPP/views/contacto.ejs', { message:'Su petición no pudo ser enviada correctamente, por favor intente nuevamente' });

        res.render('../IDAPP/views/contacto.ejs', { message:'Gracias por contactarnos, pronto le responderemos su mensaje' });
      });

    });*/
}

function guardarCodigoValidacion(id,validacion)
{
  var v = new Validacion(); 		// create a new instance of the Bear model
  v.user_id = id;
  v.Validacion = validacion;
  // save the bear and check for errors
  v.save(function(err) {});
}