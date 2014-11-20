var Contacto            = require('../models/contacto');

module.exports = function(app) {

    app.get('/about', function(req, res) {
        res.render('../IDAPP/views/about.ejs');
    });

    app.get('/contacto', function(req, res) {
        res.render('../IDAPP/views/contacto.ejs', { message:'' });
    });

    app.post('/contacto',function(req, res) {

      var contacto = new Contacto(); 		// create a new instance of the Bear model
      contacto.local.Nombre = req.body.nombre;
      contacto.local.Apellido = req.body.apellido;
      contacto.local.Email = req.body.email;
      contacto.local.Mensaje = req.body.mensaje;
      contacto.local.Fecha = new Date();

      // save the bear and check for errors
      contacto.save(function(err) {
        if (err)
          res.render('../IDAPP/views/contacto.ejs', { message:'Su petición no pudo ser enviada correctamente, por favor intente nuevamente' });

        res.render('../IDAPP/views/contacto.ejs', { message:'Gracias por contactarnos, pronto le responderemos su mensaje' });
      });

    })
    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    app.get('/:app_id/dashboard', isLoggedIn, function(req, res) {
    //  res.render('../IDAPP/views/index.ejs');
      res.send('hello ' + req.params.app_id + '!');
    });

    // ===========================================
    // CONTABILIDAD
    app.get('/dashboard', function(req, res) {
        res.render('../IDAPP/views/admin/admin.ejs', { message:'' });
    });

    /*app.post('/contacto',function(req, res) {

      var contacto = new Contacto(); 		// create a new instance of the Bear model
      contacto.local.Nombre = req.body.nombre;
      contacto.local.Apellido = req.body.apellido;
      contacto.local.Email = req.body.email;
      contacto.local.Mensaje = req.body.mensaje;
      contacto.local.Fecha = new Date();

      // save the bear and check for errors
      contacto.save(function(err) {
        if (err)
          res.render('../IDAPP/views/contacto.ejs', { message:'Su petición no pudo ser enviada correctamente, por favor intente nuevamente' });

        res.render('../IDAPP/views/contacto.ejs', { message:'Gracias por contactarnos, pronto le responderemos su mensaje' });
      });

    })*/

};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.render('../IDAPP/views/login.ejs', { message: 'Debes iniciar sesion para ingresar' });
}
