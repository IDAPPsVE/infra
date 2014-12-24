var express  = require('express');

var Validacion  = require('./models/ValidacionUsuario');
var base = process.env.PWD;

var busboy = require('connect-busboy');
var fs = require('fs-extra');

var rs = require(base + '/IDAPP/helpers/randomString');
var email = require(base + '/IDAPP/controllers/mailController');

var Asistencia = require(base + '/HUB/MaraBox/models/Asistencia');
var Usuario = require(base + '/HUB/MaraBox/models/Usuarios');
var Box = require(base + '/IDAPP/models/Boxes');
var Ejercicios = require(base + '/HUB/MaraBox/models/Ejercicios');
var WOD = require(base + '/HUB/MaraBox/models/WOD');
var Evento = require(base + '/HUB/MaraBox/models/Eventos');
var Notificacion =  require(base + '/HUB/MaraBox/models/Notificaciones');


module.exports = function(app,passport) {
    
    app.use('/public', express.static(base + '/HUB/MaraBox/public'));
    
    app.get('/MaraBox/', function(req, res) {
        res.json({ message: 'MaraBox' });
    });
    
    app.get('/MaraBox/atletas/:id', function(req, res) {
      res.json({ message: 'MaraBox ' + req.params.id });
    });
    
    app.get('/MaraBox/admin/registroNuevoUsuario', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/signup.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/admin/registroNuevoUsuario', function(req, res, next) {
        passport.authenticate('local-signupMaraBox', function(err, user, info) {
        
        var randomString = rs.randomString(10);
        guardarCodigoValidacion(user._id, randomString);
        email.sendValidationCodeMaraBox(user.Email,randomString);
        
        return res.json({'err':err,'user':user,'info':info});

      })(req, res, next);
    });
    
    app.get('/MaraBox/admin/nuevoWod', function(req, res) {
      
        Ejercicios.find(function(err, ejercicios) {
        if (err) return console.error(err);
        else res.render(base + '/HUB/MaraBox/views/wod.ejs', { message: '', ejercicios:ejercicios });
        });
        
    });
    
    app.post('/MaraBox/admin/nuevoWod', function(req, res) {
      
      console.log(req.body);
      
        var wod = new WOD(); 		// create a new instance of the Bear model
      wod.idBox = req.body.nombre;
      wod.WarmUp.push(req.body.warmup);
      wod.WOD.push(req.body.wod);
      wod.BuyOut.push(req.body.buyout);

      // save the bear and check for errors
      wod.save(function(err) {
        if (err)
        {
          Ejercicios.find(function(errE, ejercicios) {
            if (errE) return console.error(errE);
            else res.render(base + '/HUB/MaraBox/views/wod.ejs', { message: 'Hubo un error, intente nuevamente', ejercicios:ejercicios });
          });
        }
        else
        {
          Ejercicios.find(function(errE, ejercicios) {
            if (errE) return console.error(errE);
            else res.render(base + '/HUB/MaraBox/views/wod.ejs', { message: 'El WOD fue guardado con exito', ejercicios:ejercicios });
          });
        }
      });
    });
    
    app.get('/MaraBox/admin/nuevaEvento', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/nuevoEvento.ejs', { fecha : req.params.fecha, hora : req.params.hora, message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/admin/nuevaEvento', function(req, res) {
      
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
      
        e.MaraBox.Imagen = i;
        e.MaraBox.Nombre = n;
        e.MaraBox.Ciudad = c;
        e.MaraBox.Estado = es; 
        e.MaraBox.Direccion = d;
        e.MaraBox.FechaInicio = fi;
        e.MaraBox.FechaCulminacion = fc;
        e.MaraBox.Costo = cos;
      
        e.save(function(err) {
          if (err)
          {
            res.render(base + '/HUB/MaraBox/views/nuevoEvento.ejs', { message: 'Hubo un error, intente nuevamente' });
            res.end();
          }
          else
          {
            res.render(base + '/HUB/MaraBox/views/nuevoEvento.ejs', { message: 'El evento fue guardado con exito' });
            res.end();
          }
        });
        console.log('Done parsing form!');
        

    })
    req.pipe(req.busboy);
      
    
      /*var fstream;
        req.pipe(req.busboy);
        console.log(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            fstream = fs.createWriteStream(base + '/HUB/MaraBox/public/img/' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);              
                res.redirect('back');           //where to go next
            });
        });
        */
    });
    
    app.get('/MaraBox/admin/nuevaNotificacion', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/nuevaNotificacion.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/admin/nuevaNotificacion', function(req, res) {
        var notificacion = new Notificacion(); 		// create a new instance of the Bear model
          notificacion.MaraBox.Titulo = req.body.titulo;
          notificacion.MaraBox.Mensaje = req.body.mensaje;
          
          // save the bear and check for errors
          notificacion.save(function(err) {
            if (err) 
              res.render(base + '/MaraBox/views/nuevaNotificacion.ejs', { message:'El mensaje no pudo ser enviado, intente nuevamente' });
            else
              res.render(base + '/MaraBox/views/nuevaNotificacion.ejs', { message:'El mensaje fue enviado con exito' });
              
              // Enviar a todas las plataformas via push notifications
          }); 
    });
    
    app.get('/MaraBox/admin/:fecha', function(req, res) {

    });
    
    app.get('/MaraBox/admin/:fecha/:hora', function(req, res) {

    });
    
    app.get('/MaraBox/admin/:fecha/:hora/registroAsistencia', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { fecha : req.params.fecha, hora : req.params.hora, message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/admin/:fecha/:hora/registroAsistencia', function(req, res) {
        
        var cedula = getUserId(cedula);
        if(!cedula)
        {
          res.render(base + '/MaraBox/views/registroAsistencia.ejs', { message:'El usuario no esta registrado en la base de datos' });
        }
        else
        {
          var asistencia = new Asistencia(); 		// create a new instance of the Bear model
          asistencia.MaraBox.idUsuario = getUserId(req.body.cedula);
          asistencia.MaraBox.idBox = getMaraBoxId();
          asistencia.MaraBox.Hora = req.body.hora;
          asistencia.MaraBox.Fecha = req.body.fecha;

          // save the bear and check for errors
          asistencia.save(function(err) {
            if (err) 
              res.render(base + '/MaraBox/views/registroAsistencia.ejs', { message:'El usuario no pudo ser registrado' });
            else
              res.render(base + '/MaraBox/views/registroAsistencia.ejs', { message:'Usuario registrado para el entrenamiento del dia '+req.body.fecha+' hora '+req.body.hora });  
          }); 
        }
        
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

function getMaraBoxId()
{
  Box.findOne({ 'Nombre' : 'MaraBox' }, function(err, box) {
            // if there are any errors, return the error before anything else
            if (err)
                return null;

            return box._id;

        });
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