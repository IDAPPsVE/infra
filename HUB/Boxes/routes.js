module.exports = function(app) {
    app.get('/box/:idBox/', function(req, res) {

    });
    
    app.get('/box/:idBox/atletas/:id', function(req, res) {

    });
    
    app.get('/box/:idBox/admin/registroNuevoUsuario', function(req, res) {

    });
    
    app.post('/box/:idBox/admin/registroNuevoUsuario', function(req, res) {

    });
    
    app.get('/box/:idBox/admin/nuevoWod', function(req, res) {

    });
    
    app.post('/box/:idBox/admin/nuevoWod', function(req, res) {

    });
    
    app.get('/box/:idBox/admin/nuevaNotificacion', function(req, res) {

    });
    
    app.post('/box/:idBox/admin/nuevaNotificacion', function(req, res) {

    });
    
    app.get('/box/:idBox/admin/:fecha', function(req, res) {

    });
    
    
    
    
    //////////////////////////////////////////////////////
    // API
    //////////////////////////////////////////////////////
    app.post('/api/0.1/registroUsuario', function(req, res) {

    });
    app.post('/api/0.1/login', function(req, res) {

    });
    app.get('/api/0.1/logout', function(req, res) {

    });
    app.post('/api/0.1/uploadUserPic', function(req, res) {

    });
    app.get('/api/0.1/getUserPic', function(req, res) {

    });
    app.post('/api/0.1/asistencia', function(req, res) {

    });
    app.post('/api/0.1/:evento/asistir', function(req, res) {

    });
    app.post('/api/0.1/registroRM', function(req, res) {

    });
    app.get('/api/0.1/progreso', function(req, res) {

    });
    app.get('/api/0.1/:idEjercicio', function(req, res) {

    });
    app.get('/api/0.1/ejercicios', function(req, res) {

    });
    app.get('/api/0.1/WOD/:fecha', function(req, res) {

    });
    app.get('/api/0.1/eventos', function(req, res) {

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