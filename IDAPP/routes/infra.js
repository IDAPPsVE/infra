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
    });

    app.post('/registroContrato',function(req, res) {

      var nombreApp = req.body.app;
      var correo = req.body.correo;
      var contratoN  = req.body.contrato;
      var android = 0;
      var ios = 0;
      var adm = 0;
      
      console.log(req.body);
      
      if ((req.body.rif === null) ||
      (req.body.empresa === null) ||
      (req.body.direccion === null) ||
      (correo === null) ||
      (nombreApp === null))
      {
        return res.render('../IDAPP/views/registroContrato.ejs', { message:'Todos los campos de texto son obligatorios.' });
      }
      else
      {
        Contrato.findOne({ 'IDAPP.Contrato' : contratoN }, function(err, c) {
        if (err)
        {
          return null;
        }

        if (c === null)
        {
          if (req.body.android === "on"){
            android = 1;
          }
          if (req.body.ios === "on"){
            ios = 1;
          }
          if (req.body.administrativo === "on"){
            adm = 1;
          }
          console.log(req.body.android, req.body.ios, req.body.administrativo);
          var contrato = new Contrato(); 		// create a new instance of the Bear model
          contrato.IDAPP.Contrato          = contratoN;
          contrato.IDAPP.Android           = android;
          contrato.IDAPP.iOS               = ios;
          contrato.IDAPP.Administrativo    = adm;
          contrato.IDAPP.Facturacion       = req.body.facturacion;
          contrato.IDAPP.RIF               = req.body.rif;
          contrato.IDAPP.Empresa           = req.body.empresa;
          contrato.IDAPP.Telefono_Oficina  = req.body.telefonoOficina;
          contrato.IDAPP.Telefono_Personal = req.body.telefonoPersonal;
          contrato.IDAPP.Direccion         = req.body.direccion;
          contrato.IDAPP.Correo_Contacto   = correo;
          contrato.IDAPP.Nombre_APP        = nombreApp;
    
          // save the bear and check for errors
          contrato.save(function(err) {
            console.log(err);
            if (err)
            {
              return res.render('../IDAPP/views/registroContrato.ejs', { message:'No se pudo registrar el nuevo contrato, por favor intente nuevamente' });
            }
            else
            {
              guardarBoxEnBoxes(correo, nombreApp);
              return res.render('../IDAPP/views/registroContrato.ejs', { message:'Contrato registrado con éxito' });
            }
          });
        }
        else
        {
          return res.render('../IDAPP/views/registroContrato.ejs', { message:'El numero de contrato ingresado ya esta registrado' });
        }
      });
      }
           
      
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
  console.log("obtenerContratoId(nombreApp)", nombreApp);
  Contrato.findOne({ 'IDAPP.Nombre' : nombreApp}, function(err, contrato) {
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
  console.log("guardarBoxEnBoxes(to, nombreApp)",to, nombreApp);
  var b = new B();
  b.IDAPP.Nombre = nombreApp;
  b.IDAPP.idContrato = obtenerContratoId(nombreApp);
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
  B.findOne({ 'IDAPP.Nombre' : nombreApp }, function(err, box) {
    // if there are any errors, return the error before anything else
    if (err)
    {
      return null;
    }
    if (box)
      console.log("obtenerBoxId(nombreApp)",box._id);
      return box._id;
    });
}

function guardarBoxCode(boxId)
{
  var s = rs.randomString(8);
  var bc = new BC();
  bc.IDAPP.Codigo = s;
  bc.IDAPP.idBox = boxId;
  bc.save(function(err) {
    if (err)
    {}
  });
}

function obtenerBoxCode(boxId)
{
  BC.findOne({ 'IDAPP.idBox' : boxId }, function(err, boxCode) {
    // if there are any errors, return the error before anything else
    if (err)
    {
      return null;
    }
    if (boxCode)
    console.log("obtenerBoxCode(boxId)",boxCode.Codigo);
      return boxCode.Codigo;
    });
}

function guardarBoxAdminCode(boxId)
{
  var s = rs.randomString(8);
  var bac = new BAC();
  bac.IDAPP.Codigo = s;
  bac.IDAPP.idBox = boxId;
  bac.save(function(err) {
    if (err)
    {}
  });
}

function obtenerBoxAdminCode(boxId)
{
  BAC.findOne({ 'IDAPP.idBox' : boxId }, function(err, boxAdminCode) {
    // if there are any errors, return the error before anything else
    if (err)
    {
      return null;
    }
    if (boxAdminCode)
    console.log("obtenerBoxAdminCode(boxId)",boxAdminCode.Codigo);
      return boxAdminCode.Codigo;
    });
}

function enviarBoxYBoxAdminCode(to, boxId, boxAdmin)
{
  email.sendBoxAndBoxsdminCode(to, boxId, boxAdmin);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.render('../IDAPP/views/login.ejs', { message: 'Debes iniciar sesion para ingresar' });
}
