var express  = require('express');

var Validacion  = require('./models/ValidacionUsuario');
var base = process.env.PWD;

var busboy = require('connect-busboy');
var fs = require('fs-extra');

var rs = require(base + '/IDAPP/helpers/randomString');
var email = require(base + '/IDAPP/controllers/mailController');

var Asistencia = require(base + '/HUB/Boxes/models/Asistencia');
var Usuario = require(base + '/HUB/Boxes/models/Usuarios');
var Box = require(base + '/IDAPP/models/Boxes');
var Ejercicios = require(base + '/HUB/Boxes/models/Ejercicios');
var WOD = require(base + '/HUB/Boxes/models/WOD');
var Evento = require(base + '/HUB/Boxes/models/Eventos');
var Notificacion =  require(base + '/HUB/Boxes/models/Notificaciones');


module.exports = function(app) {
    app.get('/box/:idBox/', function(req, res) {
      res.json({ message: 'MaraBox' });
    });
    
    app.get('/box/:idBox/atletas/:id', function(req, res) {

    });
    
    app.get('/box/:idBox/admin/registroNuevoUsuario', function(req, res) {
      var p = req.params.idBox;
      var url = "/box/"+p+"/admin/registroNuevoUsuario'";
      res.render(base + '/HUB/Boxes/views/signup.ejs', { message: req.flash('loginMessage'), url:url });
    });
    
    app.post('/box/:idBox/admin/registroNuevoUsuario', function(req, res, next) {
      passport.authenticate('local-signupBoxes', function(err, user, info) {
        
        var randomString = rs.randomString(10);
        guardarCodigoValidacion(user._id, randomString);
        email.sendValidationCodeMaraBox(user.Email,randomString);
        
        return res.json({'err':err,'user':user,'info':info});

      })(req, res, next);
    });
    
    app.get('/box/:idBox/admin/nuevoWod', function(req, res) {
      Ejercicios.find(function(err, ejercicios) {
        if (err) return console.error(err);
        else
        {
          var p = req.params.idBox;
          var url = "/box/"+p+"/admin/nuevoWod";
          res.render(base + '/HUB/Boxes/views/wod.ejs', { message: '', ejercicios:ejercicios, url:url });
        }
        });
    });
    
    app.post('/box/:idBox/admin/nuevoWod', function(req, res) {
      
      var dictWU = [];
      var dictWD = [];
      var dictBO = [];
      
      if (req.body.warmup.length == 24)
      {
        dictWU.push({
          idEjercicio : req.body.warmup,
          Cantidad    : req.body.cwu[0]
        });
      }
      else
      {
        for(var i = 0; i < req.body.warmup.length; i++) {
          dictWU.push({
            idEjercicio : req.body.warmup[i],
            Cantidad    : req.body.cwu[i]
          });
        }  
      }
      
      if (req.body.wod.length == 24)
      {
        dictWD.push({
          idEjercicio : req.body.wod,
          Cantidad    : req.body.cwd[0]
        });
      }
      else
      {
        for(var j = 0; j < req.body.wod.length; j++) {
          dictWD.push({
            idEjercicio : req.body.wod[j],
            Cantidad    : req.body.cwd[j]
          });
        }  
      }
      
      if (req.body.buyout.length == 24)
      {
        dictBO.push({
          idEjercicio : req.body.buyout,
          Cantidad    : req.body.cbo[0]
        });
      }
      else
      {
        for(var k = 0; k < req.body.buyout.length; k++) {
          dictBO.push({
            idEjercicio : req.body.buyout[k],
            Cantidad    : req.body.cbo[k]
          });
        }  
      }
      
      var wod = new WOD(); 		// create a new instance of the Bear model
      wod.Boxes.Nombre = req.body.nombreWOD;
      wod.Boxes.Timecap = req.body.timecap;
      wod.Boxes.idBox = req.body.idBox;
      wod.Boxes.WarmUp = dictWU;
      wod.Boxes.WOD = dictWD;
      wod.Boxes.BuyOut = dictBO;

      // save the bear and check for errors
      wod.save(function(err) {
        if (err)
        {
          Ejercicios.find(function(errE, ejercicios) {
            if (errE) return console.error(errE);
            else res.render(base + '/HUB/Boxes/views/wod.ejs', { message: 'Hubo un error, intente nuevamente', ejercicios:ejercicios });
          });
        }
        else
        {
          Ejercicios.find(function(errE, ejercicios) {
            if (errE) return console.error(errE);
            else res.render(base + '/HUB/Boxes/views/wod.ejs', { message: 'El WOD fue guardado con exito', ejercicios:ejercicios });
          });
        }
      });
    });
    
    app.get('/box/:idBox/eventos', function(req, res) {
      
      Evento.find(function(err, ev) {
        if (err) {
          return console.error(err);
        }
        else {
          res.render(base + '/HUB/Boxes/views/eventos.ejs', { message: '', eventos:ev.MaraBox });
        }
      });
        //res.render(base + '/HUB/Boxes/views/eventos.ejs', { message: req.flash('loginMessage') });
    });
    
    app.get('/box/:idBox/admin/nuevaEvento', function(req, res) {
      var p = req.params.idBox;
      var url = "/box/"+p+"/admin/nuevaEvento";
      res.render(base + '/HUB/Boxes/views/nuevoEvento.ejs', { fecha : req.params.fecha, hora : req.params.hora, message: req.flash('loginMessage'), url:url });
    });
    
    app.post('/box/:idBox/admin/nuevaEvento', function(req, res) {
      
      var i,n,c,es,d,fi,fc,cos;
      
      req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
        
        if(fieldname == "base64") i = val;
        if(fieldname == "nombre") n = val;
        if(fieldname == "ciudad") c = val;
        if(fieldname == "estado") es = val;
        if(fieldname == "direccion") d = val;
        if(fieldname == "fechaInicio") fi = val;
        if(fieldname == "fechaCulminacion") fc = val;
        if(fieldname == "costo") cos = val;
      });
      
      req.busboy.on('finish', function() {
        console.log(i,n,c,es,d,fi,fc,cos);
      
        var e = new Evento();
      
        e.Boxes.Imagen = i;
        e.Boxes.Nombre = n;
        e.Boxes.Ciudad = c;
        e.Boxes.Estado = es; 
        e.Boxes.Direccion = d;
        e.Boxes.FechaInicio = fi;
        e.Boxes.FechaCulminacion = fc;
        e.Boxes.Costo = cos;
      
        e.save(function(err) {
          if (err)
          {
            res.render(base + '/HUB/Boxes/views/nuevoEvento.ejs', { message: 'Hubo un error, intente nuevamente' });
            // Enviar a todas las plataformas via push notifications
            res.end();
          }
          else
          {
            res.render(base + '/HUB/Boxes/views/nuevoEvento.ejs', { message: 'El evento fue guardado con exito' });
            // Enviar a todas las plataformas via push notifications
            res.end();
          }
        });
      })
      req.pipe(req.busboy);
    });
    
    app.get('/box/:idBox/admin/nuevaNotificacion', function(req, res) {
      var p = req.params.idBox;
      var url = "/box/"+p+"/admin/nuevaNotificacion";
      res.render(base + '/HUB/Boxes/views/nuevaNotificacion.ejs', { message: req.flash('loginMessage'), url:url });
    });
    
    app.post('/box/:idBox/admin/nuevaNotificacion', function(req, res) {
      var notificacion = new Notificacion(); 		// create a new instance of the Bear model
          notificacion.Boxes.Titulo = req.body.titulo;
          notificacion.Boxes.Mensaje = req.body.mensaje;
          
          // save the bear and check for errors
          notificacion.save(function(err) {
            if (err) 
              res.render(base + '/Boxes/views/nuevaNotificacion.ejs', { message:'El mensaje no pudo ser enviado, intente nuevamente' });
            else
              res.render(base + '/Boxes/views/nuevaNotificacion.ejs', { message:'El mensaje fue enviado con exito' });
              
              // Enviar a todas las plataformas via push notifications
          });
    });
    
    app.get('/box/:idBox/admin/:fecha', function(req, res) {

    });
    
    app.get('/box/:idBox/admin/:fecha', function(req, res) {

    });
    
    app.get('/box/:idBox/admin/:fecha/:hora', function(req, res) {

    });
    
    app.get('/box/:idBox/admin/:fecha/:hora/registroAsistencia', function(req, res) {
      var p = req.params.idBox;
      var url = "/box/"+p+"/admin/"+req.params.fecha+"/"+req.params.hora+"registroAsistencia";
      res.render(base + '/HUB/Boxes/views/registroAsistencia.ejs', { fecha : req.params.fecha, hora : req.params.hora, message: req.flash('loginMessage'), url:url });
    });
    
    app.post('/box/:idBox/admin/:fecha/:hora/registroAsistencia', function(req, res) {
        
        var cedula = getUserId(cedula);
        if(!cedula)
        {
          res.render(base + '/Boxes/views/registroAsistencia.ejs', { message:'El usuario no esta registrado en la base de datos' });
        }
        else
        {
          var asistencia = new Asistencia(); 		// create a new instance of the Bear model
          asistencia.Boxes.idUsuario = getUserId(req.body.cedula);
          asistencia.Boxes.idBox = req.body.idBox;
          asistencia.Boxes.Hora = req.body.hora;
          asistencia.Boxes.Fecha = req.body.fecha;

          // save the bear and check for errors
          asistencia.save(function(err) {
            var p = req.params.idBox;
            var url = "/box/"+p+"/admin/"+req.params.fecha+"/"+req.params.hora+"/registroAsistencia";
            if (err) 
              res.render(base + '/Boxes/views/registroAsistencia.ejs', { message:'El usuario no pudo ser registrado', url:url });
            else
              res.render(base + '/Boxes/views/registroAsistencia.ejs', { message:'Usuario registrado para el entrenamiento del dia '+req.body.fecha+' hora '+req.body.hora, url:url });  
          }); 
        }
        
    });
    
    
    //////////////////////////////////////////////////////
    // API
    //////////////////////////////////////////////////////
    app.post('/api/0.1/registroUsuario', function(req, res, next) {
      passport.authenticate('local-signupBoxes', function(err, user, info) {
        var randomString = rs.randomString(10);
        guardarCodigoValidacion(user._id, randomString);
        email.sendValidationCodeMaraBox(user.Email,randomString);
        
        return res.json({'err':err,'user':user,'info':info});

      })(req, res, next);
    });
    
    app.post('/api/0.1/login', function(req, res, next) {
      passport.authenticate('local-loginBoxes', function(err, user, info) {

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
    
    app.get('/api/0.1/logout', function(req, res) {
      req.logout();
      res.json({ code : '200', message: 'Sesion terminada' });
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
}

function guardarCodigoValidacion(id,validacion)
{
  var v = new Validacion(); 		// create a new instance of the Bear model
  v.user_id = id;
  v.Validacion = validacion;
  // save the bear and check for errors
  v.save(function(err) {});
}

function getUserId(cedula)
{
  
  Usuario.findOne({ 'Cedula' :  cedula }, function(err, usuario) {
            // if there are any errors, return the error before anything else
            if (err)
                return null;

            return usuario._id;

        });
}