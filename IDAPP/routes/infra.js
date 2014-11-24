var Contacto    = require('../models/contacto');
var Contrato   = require('../models/contratos');
var Validacion  = require('../models/validacion');

module.exports = function(app) {

  /*
  *
  * Acciones comunes
  *
  */
    app.get('/about', function(req, res) {
        res.render('../IDAPP/views/about.ejs');
    });

    app.get('/contacto', function(req, res) {
        res.render('../IDAPP/views/contacto.ejs', { message:'' });
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

    });


    /*
    *
    * Registro de APPs
    *
    */
    app.get('/admin/registroContrato', isLoggedIn, function(req, res) {
        res.render('../IDAPP/views/admin/registroContrato.ejs', { message:'' });
      //res.send('hello, estas en la vista de registro de contacto');
    });

    app.get('/:validationCode', function(req, res) {
      //  res.render('../IDAPP/views/index.ejs');
      res.send('hello, your email was already validated with the code' + req.params.validationCode + '!');
    });



    /*
    *
    * Dashboards y separacion de logica
    *
    */
    app.get('/admin/dashboard', isLoggedIn, function(req, res) {
      //  res.render('../IDAPP/views/index.ejs');
      res.send('hello, estas en dashboard de IDAPP');
    });

    app.get('/:app_id/dashboard', isLoggedIn, function(req, res) {
    //  res.render('../IDAPP/views/index.ejs');
      res.send('hello ' + req.params.app_id + '!');
    });

    app.get('/:app_id/dashboard/registroAdministracion', isLoggedIn, function(req, res) {
      //  res.render('../IDAPP/views/index.ejs');
      res.send('hello, estas en la vista de registro del usuario admin del sistema administrativo');
    });

    app.post('/registroAdministracion',function(req, res) {

      var contrato = new Contrato(); 		// create a new instance of the Bear model
      contrato.Contrato          = req.body.contrato;
      contrato.Android           = req.body.android;
      contrato.iOS               = req.body.ios;
      contrato.Administrativo    = req.body.administrativo;
      contrato.Facturacion       = req.body.facturacion;
      contrato.RIF               = req.body.rif;
      contrato.Empresa           = req.body.empresa;
      contrato.Telefono_Oficina  = req.body.telefonoOficina
      contrato.Telefono_Personal = req.body.telefonoContacto;
      contrato.Direccion         = req.body.direccion;
      contrato.Fecha_Contrato    = new Date();
      contrato.Fecha_Facturacion = req.body.fechaFacturacion;
      contrato.Nombre_APP        = req.body.app
      contrato.Firmantes         = '';
      contrato.Cedula_Firmantes  = [];

      // save the bear and check for errors
      contrato.save(function(err) {
        console.log(err);
        if (err)
          res.render('../IDAPP/views/admin/registroContrato.ejs', { message:'No se pudo registrar el nuevo contrato, por favor intente nuevamente' });
        else
          res.render('../IDAPP/views/admin/registroContrato.ejs', { message:'Contrato registrado con éxito' });
        });

      });

    // ===========================================
    // CONTABILIDAD
    app.get('/dashboard', function(req, res) {
        res.render('../IDAPP/views/admin/admin.ejs', { message:'' });
    });

};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.render('../IDAPP/views/login.ejs', { message: 'Debes iniciar sesion para ingresar' });
}
