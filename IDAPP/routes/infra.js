var email = require('../controllers/mailController');
var rs = require('../helpers/randomString');
var Contacto    = require('../models/Contacto');
var Contrato   = require('../models/Contratos');
var ValidacionIDAPP  = require('../models/ValidacionIDAPP');
var ValidacionAppPropietario  = require('../models/ValidacionAppPropietario');
var B = require('../models/Boxes');
var BC = require('../models/BoxCode');
var BAC = require('../models/BoxAdminCode');

module.exports = function(app) {

  // ================================================
  //              Pagina Public IDAPP
  // ================================================
    app.get('/', function(req, res) {
      res.render('../IDAPP/views/index.ejs');
    });

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

      // save the bear and check for errors
      contacto.save(function(err) {
        if (err)
          res.render('../IDAPP/views/contacto.ejs', { message:'Su petición no pudo ser enviada correctamente, por favor intente nuevamente' });

        res.render('../IDAPP/views/contacto.ejs', { message:'Gracias por contactarnos, pronto le responderemos su mensaje' });
      });

    });


    // ================================================
    //              Validaciones
    // ================================================
    app.get('/admin/val/:validationCode', function(req, res) {
      //  res.render('../IDAPP/views/index.ejs');
      res.send('hello, your email was already validated with the code' + req.params.validationCode + '!');
    });

    app.get('/app/val/:validationCode', function(req, res) {
      //  res.render('../IDAPP/views/index.ejs');
      res.send('hello, your email was already validated with the code' + req.params.validationCode + '!');
    });


    // ================================================
    //              Admin Dashboard MaraBox
    // ================================================
    app.get('/admin/dashboard', isLoggedIn, function(req, res) {
      //  res.render('../IDAPP/views/index.ejs');
      res.send('hello, estas en dashboard de IDAPP');
    });

    app.get('/admin/registroContrato', function(req, res) {
        res.render('../IDAPP/views/registroContrato.ejs', { message:'' });
      //res.send('hello, estas en la vista de registro de contacto');
    });

    app.post('/registroContrato',function(req, res) {

      var nombreApp = req.body.app;
      var correo = req.body.correo;
      var contratoN  = req.body.contrato;

      var contrato = new Contrato(); 		// create a new instance of the Bear model
      contrato.Contrato          = contratoN;
      contrato.Android           = req.body.android;
      contrato.iOS               = req.body.ios;
      contrato.Administrativo    = req.body.administrativo;
      contrato.Facturacion       = req.body.facturacion;
      contrato.RIF               = req.body.rif;
      contrato.Empresa           = req.body.empresa;
      contrato.Telefono_Oficina  = req.body.telefonoOficina;
      contrato.Telefono_Personal = req.body.telefonoContacto;
      contrato.Direccion         = req.body.direccion;
      contrato.Correo_Contacto   = correo;
      contrato.Nombre_APP        = nombreApp;

      // save the bear and check for errors
      contrato.save(function(err) {
        console.log(err);
        if (err)
        {
          res.render('../IDAPP/views/admin/registroContrato.ejs', { message:'No se pudo registrar el nuevo contrato, por favor intente nuevamente' });
        }
        else
        {
          // Registrar box en Boxes
          // Luego, generar codigo de Box y Box Admin
          // Por ultimo, enviar correo al Usuario propietario de la app
          guardarBoxEnBoxes(correo, nombreApp);

          res.render('../IDAPP/views/admin/registroContrato.ejs', { message:'Contrato registrado con éxito' });
        }
      });

    });


    // ================================================
    //              Admin Dashboard CrossfitApp
    // ================================================

    app.get('/:app_id/dashboard', isLoggedIn, function(req, res) {
    //  res.render('../IDAPP/views/index.ejs');
      res.send('hello ' + req.params.app_id + '!');
    });

    app.get('/:app_id/dashboard/registroAdministracion', isLoggedIn, function(req, res) {
      //  res.render('../IDAPP/views/index.ejs');
      res.send('hello, estas en la vista de registro del usuario admin del sistema administrativo');
    });



};

function obtenerContratoId(nombreApp)
{
  Contrato.findOne({ 'Nombre' : nombreApp}, function(err, contrato) {
    // if there are any errors, return the error before anything else
    if (err)
    {
      return null;
    }
    if (contrato)
      return contrato._id;
    });
  }

function guardarBoxEnBoxes(to, nombreApp)
{
  var b = new B();
  b.Nombre = nombreApp;
  b.idContrato = obtenerContratoId(nombreApp);
  b.save(function(err) {
    if (err)
    {

    }
    else
    {
      var boxId = obtenerBoxId(nombreApp);
      guardarBoxCode(boxId);
      var boxCode = obtenerBoxCode(boxId);
      guardarBoxAdminCode(boxId);
      var boxAdmin = obtenerBoxAdminCode(boxId);
      enviarBoxYBoxAdminCode(to, boxCode, boxAdmin);
    }
  });
}

function obtenerBoxId(nombreApp)
{
  B.findOne({ 'Nombre' : nombreApp }, function(err, box) {
    // if there are any errors, return the error before anything else
    if (err)
    {
      return null;
    }
    if (box)
      return box._id;
    });
}

function guardarBoxCode(boxId)
{
  var s = rs.randomString(8);
  var bc = new BC();
  bc.Codigo = s;
  bc.idBox = boxId;
  bc.save(function(err) {
    if (err)
    {}
  });
}

function obtenerBoxCode(boxId)
{
  BC.findOne({ 'idBox' : boxId }, function(err, boxCode) {
    // if there are any errors, return the error before anything else
    if (err)
    {
      return null;
    }
    if (boxCode)
      return boxCode.Codigo;
    });
}

function guardarBoxAdminCode(boxId)
{
  var s = rs.randomString(8);
  var bac = new BAC();
  bac.Codigo = s;
  bac.idBox = boxId;
  bac.save(function(err) {
    if (err)
    {}
  });
}

function obtenerBoxAdminCode(boxId)
{
  BAC.findOne({ 'idBox' : boxId }, function(err, boxAdminCode) {
    // if there are any errors, return the error before anything else
    if (err)
    {
      return null;
    }
    if (boxAdminCode)
      return boxAdminCode.Codigo;
    });
}

function enviarBoxYBoxAdminCode(to, boxId, boxAdmin)
{
  email.sendValidationCode(to, boxId, boxAdmin);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.render('../IDAPP/views/login.ejs', { message: 'Debes iniciar sesion para ingresar' });
}
