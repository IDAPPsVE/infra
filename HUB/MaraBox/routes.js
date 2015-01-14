var express  = require('express');
var base = process.env.PWD;

var busboy = require('connect-busboy');
var fs = require('fs-extra');
var moment = require('moment');

var rs = require(base + '/IDAPP/helpers/randomString');
var email = require(base + '/IDAPP/controllers/mailController');

var Asistencia = require(base + '/HUB/MaraBox/models/Asistencia');
var Usuario = require(base + '/HUB/MaraBox/models/Usuarios');
var Box = require(base + '/IDAPP/models/Boxes');
var Ejercicios = require(base + '/HUB/MaraBox/models/Ejercicios');
var WOD = require(base + '/HUB/MaraBox/models/WOD');
var Evento = require(base + '/HUB/MaraBox/models/Eventos');
var Notificacion =  require(base + '/HUB/MaraBox/models/Notificaciones');
var Validacion = require(base + '/HUB/MaraBox/models/ValidacionUsuario');
var Solvencia = require(base + '/HUB/MaraBox/models/Solvencia');
var Descanso = require(base + '/HUB/MaraBox/models/Descansos');
var Clases = require(base + '/HUB/MaraBox/models/Clases');
var Entrenadores = require(base + '/HUB/MaraBox/models/Entrenadores');


module.exports = function(app,passport) {
    
    app.use('/public', express.static(base + '/HUB/MaraBox/public'));

    app.get('/MaraBox/', function(req, res) {
      var a = moment('2007-10-29');
      var b = moment('2007-10-20');
      var duration = moment.duration({'days' : 25});
      var fechaMasDias = moment(b).add(duration);
      console.log("Hoy " + moment(new Date()).format("DD-MM-YYYY"));
      console.log("Diferencia " + a.diff(b, 'days'));
      console.log("Diferencia " + fechaMasDias.diff(b, 'days'));
      console.log("Esta en un intervalo? " + moment('2007-10-30').isBetween(b, fechaMasDias));
      console.log("Esta en un intervalo? " + moment('2007-10-30').isBetween(b, a));
                
        
        res.render(base + '/HUB/MaraBox/views/registroPrimerUsuario.ejs', { message: req.flash('loginMessage') });
    });
    
    app.get('/MaraBox/ValidacionUsuario/:codigoValidacion', function(req, res) {
        Validacion.findOne({ Codigo : req.params.codigoValidacion },function(err, validacion) {
          if (err) return console.error(err);
          else
          {
            validacion.CorreoValidado = 1;
            validacion.save(function(errv) {
              if(errv) {
                res.render(base + '/HUB/MaraBox/views/validacionUsuario.ejs', { codigo : req.params.codigoValidacion, message: 'Disculpe, intente nuevamente' });  
              }
              else {
                res.render(base + '/HUB/MaraBox/views/validacionUsuario.ejs', { codigo : req.params.codigoValidacion, message: '' });    
              }
            });
          }
        });
    });
    
    app.post('/MaraBox/validarCedula', function(req, res) {
      
      Validacion.findOne({ Codigo : req.body.codigo },function(errv, validacion) {
          if (errv) return console.error(errv);
          else
          {
            Usuario.findById( validacion.idUsuario,function(erru, usuario) {
              if (erru) return console.error(erru);
              else
              {
                if (usuario.Cedula == req.body.cedula)
                {
                  validacion.CedulaValidada = 1;
                  validacion.save(function(errvv) {
                    if(errvv) {
                      res.render(base + '/HUB/MaraBox/views/validacionUsuario.ejs', { message: 'Disculpe, intente nuevamente' });  
                    }
                    else {
                      res.render(base + '/HUB/MaraBox/views/validacionUsuario.ejs', { message: 'Cedula validada correctamente' });    
                    }
                  });
                }
                else{
                  res.render(base + '/HUB/MaraBox/views/validacionUsuario.ejs', { message: 'Disculpe, El numero de cedula de identidad no concuerda con el ingresado al momento de registrarse, por favor intente de nuevo.' });
                }
              }
            }); 
          }
        });
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
        var url = "/MaraBox/ValidacionUsuario/"+randomString;
        email.sendValidationUsuarioMaraBox(user.Email,url);
        
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
      wod.MaraBox.Nombre = req.body.nombreWOD;
      wod.MaraBox.Timecap = req.body.timecap;
      wod.MaraBox.idBox = getMaraBoxId();
      wod.MaraBox.WarmUp = dictWU;
      wod.MaraBox.WOD = dictWD;
      wod.MaraBox.BuyOut = dictBO;

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
    
    app.get('/MaraBox/eventos', function(req, res) {
      Evento.find(function(err, ev) {
        if (err) {
          return console.error(err);
        }
        else {
          res.render(base + '/HUB/MaraBox/views/eventos.ejs', { message: '', eventos:ev.MaraBox });
        }
      });
        //res.render(base + '/HUB/MaraBox/views/eventos.ejs', { message: req.flash('loginMessage') });
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
            // Enviar a todas las plataformas via push notifications
            res.end();
          }
          else
          {
            res.render(base + '/HUB/MaraBox/views/nuevoEvento.ejs', { message: 'El evento fue guardado con exito' });
            // Enviar a todas las plataformas via push notifications
            res.end();
          }
        });
        console.log('Done parsing form!');
        

    })
    req.pipe(req.busboy);
    
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
              res.render(base + '/HUB/MaraBox/views/nuevaNotificacion.ejs', { message:'El mensaje no pudo ser enviado, intente nuevamente' });
            else
              res.render(base + '/HUB/MaraBox/views/nuevaNotificacion.ejs', { message:'El mensaje fue enviado con exito' });
              
              // Enviar a todas las plataformas via push notifications
          }); 
    });
    
    app.get('/MaraBox/admin/registroSolvencia', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/registroSolvencia.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/admin/registroSolvencia', function(req, res) {
      
        var cedula = req.body.cedula;
        var userid = getUserId(cedula);
        var dh = 0;
        var fi = moment(req.body.fechaInicio);
        var fc = moment(req.body.fechaCulminacion);
        
        var totalDias = fi.diff(fc, 'days');
        
        Descanso.find(function(errd, descanso) {
                if (errd){}
                else{
                  if(descanso)
                  {
                    var i = false;
                    descanso.forEach(function(d){
                      i = moment(d.Fecha).isBetween(fi, fc);
                      if (i)
                      {
                        dh++;
                        i = false;
                      }
                    });
                  }
                }
              });
              
        var solvencia = new Solvencia(); 		// create a new instance of the Bear model
          solvencia.MaraBox.idUsuario = userid;
          solvencia.MaraBox.FechaInicio = req.body.fechaInicio;
          solvencia.MaraBox.FechaCulminacion = req.body.fechaCulminacion;
          solvencia.MaraBox.DiasHabiles = totalDias + dh;
          
          // save the bear and check for errors
          solvencia.save(function(err) {
            if (err) 
              res.render(base + '/HUB/MaraBox/views/nuevaNotificacion.ejs', { message:'El mensaje no pudo ser enviado, intente nuevamente' });
            else
              res.render(base + '/HUB/MaraBox/views/nuevaNotificacion.ejs', { message:'Registro guardado con exito' });
              
              // Enviar a todas las plataformas via push notifications
          }); 
    });
    
    app.get('/MaraBox/admin/registroFeriado', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/registroFeriado.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/admin/registroFeriado', function(req, res) {
          var descanso = new Descanso();
          descanso.MaraBox.Fecha = req.body.fecha;
          descanso.MaraBox.DiaCompleto = req.body.diaCompleto;
          descanso.MaraBox.Hora = req.body.hora;
          descanso.MaraBox.Motivo = req.body.motivo;
          
          // save the bear and check for errors
          descanso.save(function(err) {
            if (err) 
              res.render(base + '/HUB/MaraBox/views/registroFeriado.ejs', { message:'El registro no pudo ser guardado, intente nuevamente' });
            else
              res.render(base + '/HUB/MaraBox/views/registroFeriado.ejs', { message:'Registro guardado con exito' });
              
              // Enviar a todas las plataformas via push notifications
          });
    });
    
    app.get('/MaraBox/admin/:fecha', function(req, res) {
      Entrenadores.find(function(err, coach) {
        if (err) return console.error(err);
        else
        {
          if (coach)
          {
            res.render(base + '/HUB/MaraBox/views/asignacionCoach.ejs', { fecha : req.params.fecha, entrenadores : coach, message: req.flash('loginMessage') });
          }
        }
      });
    });
    
    app.post('/MaraBox/admin/asignacionEntrenador', function(req, res) {
      var clases = new Clases();
      clases.MaraBox.idEntrenador = req.body.entrenador;
      clases.MaraBox.Fecha = req.body.fecha;
      clases.MaraBox.Hora = req.body.hora;
      
      clases.save(function(err) {
            if (err) 
              res.render(base + '/HUB/MaraBox/views/registroFeriado.ejs', { message:'El registro no pudo ser guardado, intente nuevamente' });
            else
              Entrenadores.find(function(err, coach) {
                if (err) return console.error(err);
                else
                {
                  if (coach)
                  {
                    res.render(base + '/HUB/MaraBox/views/asignacionCoach.ejs', { fecha : req.params.fecha, entrenadores : coach, message: "El entrenador fue asignado con exito" });
                  }
                }
              });
          });
    });
    
    app.get('/MaraBox/admin/:fecha/:hora', function(req, res) {
      res.render(base + '/HUB/MaraBox/views/listaAsistenciaClase.ejs', { fecha : req.params.fecha, message: req.flash('loginMessage') });
    });
    
    app.get('/MaraBox/admin/registroAsistencia', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/admin/registroAsistencia', function(req, res) {
        
        var cedula = getUserId(cedula);
        if(!cedula)
        {
          res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'El usuario no esta registrado en la base de datos', regman : 1 });
        }
        else
        {
          var idu = getUserId(req.body.cedula);
          var solvente = verificarSolvencia(idu);
          
          if (solvente)
          {
            var asistencia = new Asistencia();
            asistencia.MaraBox.idUsuario = idu;
            asistencia.MaraBox.idBox = getMaraBoxId();
            asistencia.MaraBox.idClase = getClaseId(req.body.hora);

            // save the bear and check for errors
            asistencia.save(function(err) {
              if (err) 
                res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'El usuario no pudo ser registrado' });
              else
                res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'Usuario registrado para el entrenamiento del dia '+req.body.fecha+' hora '+req.body.hora });  
            });  
          }
          else
          {
            res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'El usuario no aparece registrado en el registro de solvencias del Box, por favor actualice los datos de la solvencia del usuario para poder continuar con el registro.' });
          }
        }
    });
    
    app.get('/MaraBox/admin/registroPrimerUsuario', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/registroPrimerUsuario.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/admin/primerUsuariop', function(req, res) {
       /* var notificacion = new Notificacion(); 		// create a new instance of the Bear model
          notificacion.MaraBox.Titulo = req.body.titulo;
          notificacion.MaraBox.Mensaje = req.body.mensaje;
          
          // save the bear and check for errors
          notificacion.save(function(err) {
            if (err) 
              res.render(base + '/HUB/MaraBox/views/nuevaNotificacion.ejs', { message:'El mensaje no pudo ser enviado, intente nuevamente' });
            else
              res.render(base + '/HUB/MaraBox/views/nuevaNotificacion.ejs', { message:'El mensaje fue enviado con exito' });
              
              // Enviar a todas las plataformas via push notifications
          }); */
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
        var url = "/MaraBox/ValidacionUsuario/"+randomString;
        email.sendValidationUsuarioMaraBox(user.Email,url);
        
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
      var idu = getUserId(req.body.cedula);
      var solvente = verificarSolvencia(idu);
          
      if (solvente)
      {
        var asistencia = new Asistencia();
        asistencia.MaraBox.idUsuario = 
        asistencia.MaraBox.idBox = getMaraBoxId();
        asistencia.MaraBox.Hora = req.body.hora;
        asistencia.MaraBox.Fecha = req.body.fecha;

        asistencia.save(function(err) {
          if (err) 
            res.json({ code : '-1000', message: 'No se pudo guardar los datos, intente nuevamente' });
          else
            res.json({ code : '200', message: 'Asistencia guardada con exito' });    
        });
      }
      else
      {
        res.json({ code : '-100', message: 'A la fecha usted no se encuentra solvente, por favor dirijase a caja para solventar este incoveniente' });
      }
    });
    
    app.post('/MaraBox/:evento/asistir', function(req, res) {

    });
    app.post('/MaraBox/registroRM', function(req, res) {

    });
    app.get('/MaraBox/progreso', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });
    
    app.get('/MaraBox/ejercicios', function(req, res) 
    {
      Ejercicios.find(function(errE, ejercicios) {
          if (errE)
          {
            res.json({ code : "-100", mensaje : "No se pudo obtener los datos" });
          }
          else
          {
            res.json({ code : "200", ejercicios : ejercicios });
          }
      });
    });
    
    app.get('/MaraBox/ejercicios/:idEjercicio', function(req, res) 
    {
      Ejercicios.findOne({ 'Email' :  req.params.idEjercicio }, function(errE, ejercicio) {
          if (errE)
          {
            res.json({ code : "-100", mensaje : "No se pudo obtener los datos" });
          }
          else
          {
            res.json({ code : "200", ejercicio : ejercicio });
          }
      });
    });
    
    app.get('/MaraBox/WOD', function(req, res) {
        WOD.find(function(errE, wod) {
          if (errE)
          {
            res.json({ code : "-100", mensaje : "No hay WOD registrado para hoy" });
          }
          else
          {
            res.json({ code : "200", wod : wod });
          }
      });
    });
    
    app.get('/MaraBox/eventos', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });
    
}

function guardarCodigoValidacion(id,validacion)
{
  var v = new Validacion(); 		// create a new instance of the Bear model
  v.idUsuario = id;
  v.Codigo = validacion;
  v.idBox = getMaraBoxId();
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
            if (err) return null;
            else 
            {
              console.log(usuario);
              if (usuario)
              {
                console.log(usuario._id);
                return usuario._id;

              }
              else
              {
                return null;
              }
              
              
            }
        });
}

function getClaseId(hora)
{
  Clases.findOne({ 'Fecha' : hoy(), 'Hora' :  hora }, function(err, clase) {
            // if there are any errors, return the error before anything else
            if (err) return null;
            else 
            {
              if (clase)
              {
                return clase._id;

              }
              else
              {
                return null;
              }
            }
        });
}

function verificarSolvencia(userid)
{
  var solvente = false;
  Solvencia.find({ 'idUsuario' : userid }, function(err, solvencia) {
            // if there are any errors, return the error before anything else
            if (err) return null;
            else
            {
              if(solvencia)
              {
                var duration = moment.duration({'days' : solvencia.DiasHabiles});
                var fechaMasDias = moment(solvencia.FechaInicio).add(duration);
                solvente = moment().isBetween(solvencia.FechaInicio, fechaMasDias);
                return solvente;
              }
              else
              {
                return solvente;
              }
            }
            

        }); 
}

function verificarCierreDelBox()
{
  var diaDescanso = 0;
  Descanso.find({'Fecha' : new Date()} , function(errd, descanso) {
                if (errd){}
                else{
                  if(descanso)
                  {
                    diaDescanso = descanso.DiaCompleto;
                    return diaDescanso;
                  }
                  else
                  {
                    return diaDescanso;
                  }
                }
              });
}

function hoy()
{
  return moment(new Date()).format("DD-MM-YYYY");
}

function formatearFecha(fecha)
{
  return moment(fecha).format("DD-MM-YYYY");
}