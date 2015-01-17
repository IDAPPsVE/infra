var express  = require('express');
var base = process.env.PWD;

var busboy = require('connect-busboy');
var fs = require('fs-extra');


var rs = require(base + '/IDAPP/helpers/randomString');
var f = require(base + '/IDAPP/helpers/dates');
var h = require(base + '/HUB/MaraBox/helpers');
var email = require(base + '/IDAPP/controllers/mailController');

//import modelos
var Asistencia = require(base + '/HUB/MaraBox/models/Asistencia');
var Usuario = require(base + '/HUB/MaraBox/models/Usuarios');
var InfoUsuario = require(base + '/HUB/MaraBox/models/InfoUsuarios');
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

    //=========================================================
    //          Pagina de inicio y Perfiles de Usuario
    //=========================================================
    
    app.get('/MaraBox/api/test'), function(req, res)
    {
        return res.json({ code:'200', message:'Hola!' });
    }
    
    app.get('/MaraBox/', function(req, res) {
      return res.json({ code:'200', message:'Hola!' });
      //res.render(base + '/HUB/MaraBox/views/index.ejs', { message: req.flash('loginMessage') });
    });
    
    app.get('/MaraBox/super/dashboard', function(req, res) {
      res.render(base + '/HUB/MaraBox/views/dashboard-super.ejs', { message: req.flash('loginMessage') });
    });
    
    app.get('/MaraBox/admin/dashboard', function(req, res) {
      res.render(base + '/HUB/MaraBox/views/dashboard.ejs', { message: req.flash('loginMessage') });
    });
    
    //=========================================================
    //                    Signup y Login
    //=========================================================
    
    // process the login form
    app.post('/MaraBox/login', function(req, res,next) {
      passport.authenticate('local-loginMaraBoxAdmin', function(err, user, info) {
        var userNeededData = {'id':user._id,
                              'Email':user.Email,
                              'Tipo':user.Tipo,
                              'isLoggedIn':'1'};
        req.login(userNeededData, function(err) {
          if (err) { return next(err); }
            if(user.Tipo == 4)
              {
                res.redirect('/MaraBox/super/dashboard');
              }
            else if((user.Tipo == 5) || (user.Tipo == 6))
            {
              res.redirect('/MaraBox/admin/dashboard');
            }
            else
            {
              res.render(base + '/HUB/MaraBox/views/index.ejs', { message: "Disculpe, el usuario ingresado no tiene los privilegios suficiente para ingresar al sistema. Puede usar la aplicacion para Android o iPhone" });
            }
        });
      })(req, res, next);
    });
    
    // show the signup form
    app.get('/MaraBox/signup', function(req, res) {
      res.render(base + '/HUB/MaraBox/views/signup.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/MaraBox/signup', function(req, res,next) {
      passport.authenticate('local-signupMaraBoxAdmin', function(err, user, info) {
        var randomString = rs.randomString(20);
        h.guardarCodigoValidacion(user._id, randomString);
        email.sendValidationCode(user.Email,randomString);
        if (err){}
        else
        {
          res.render(base + '/HUB/MaraBox/views/signup.ejs', { message: "El usuario fue registrado con exito" });
        }
      })(req, res, next);
    });
    
    
    //=========================================================
    //            Validacion de cuentas de usuario
    //=========================================================
    
    
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
    
    
    //=========================================================
    //            Funciones de Superusuario
    //=========================================================
    
    app.get('/MaraBox/super/privilegiados', function(req, res) {
      
      var u4 = [];
      var u5 = []; 
      var u6 = [];
      
      Usuario.find({ Tipo : "4"}, function(erru, superU) {
          if (superU)
          {
            superU.forEach(function(a){
              var iu = h.getInfoUsuario(superU._id);
              u4.push({cedula:iu[0], nombre:iu[1], apellido:iu[2] });
            });
          }
      });
      Usuario.find({ Tipo : "5"}, function(erru, admin) {
          if (admin)
          {
            admin.forEach(function(a){
              var iu = h.getInfoUsuario(admin._id);
              u5.push({cedula:iu[0], nombre:iu[1], apellido:iu[2] });
            });
          }
      });
      Usuario.find({ Tipo : "6"}, function(erru, coach) {
          if (coach)
          {
            coach.forEach(function(a){
              var iu = h.getInfoUsuario(coach._id);
              u6.push({cedula:iu[0], nombre:iu[1], apellido:iu[2] });
            }); 
          }
      });
      
        res.render(base + '/HUB/MaraBox/views/usuariosConPermisos.ejs', { superU : u4, admin : u5, coach : u6, message: req.flash('loginMessage') });
    });
    
    app.get('/MaraBox/super/cambiarPermisos', function(req, res) {
      var u5 = []; 
      var u6 = [];
      Usuario.find({ Tipo : "5"}, function(erru, admin) {
          if (admin)
          {
            admin.forEach(function(a){
              var iu = h.getInfoUsuario(admin._id);
              u5.push({id:admin._id, cedula:iu[0], nombre:iu[1], apellido:iu[2] });
            });
          }
      });
      Usuario.find({ Tipo : "6"}, function(erru, coach) {
          if (coach)
          {
            coach.forEach(function(a){
              var iu = h.getInfoUsuario(coach._id);
              u6.push({id:coach._id, cedula:iu[0], nombre:iu[1], apellido:iu[2] });
            }); 
          }
      });
        res.render(base + '/HUB/MaraBox/views/cambiarPermisos.ejs', { admin : u5, coach : u6, message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/super/cambiarPermisos', function(req, res) {
      Usuario.findById(req.body.id, function(erru, usuario) {
         usuario.Tipo = req.body.tipo;
         usuario.save(function(err) {
           if (err){
             return res.redirect('/MaraBox/super/cambiarPermisos', { mesaage:'Ha ocurrido un problema, favor intente nuevamente' });
           }
           else
           {
             return res.redirect('/MaraBox/super/cambiarPermisos', { mesaage:'Permiso cambiado satisfactoriamente' });
           }
         });
      });
    });
    
    //=========================================================
    //                Funciones de administrador
    //=========================================================
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
      wod.MaraBox.idBox = h.getMaraBoxId();
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
        var userid = h.getUserId(cedula);
        var dh = 0;
        var fi = f.fecha(req.body.fechaInicio);
        var fc = f.fecha(req.body.fechaCulminacion);
        
        var totalDias = fi.diff(fc, 'days');
        
        Descanso.find(function(errd, descanso) {
                if (errd){}
                else{
                  if(descanso)
                  {
                    var i = false;
                    descanso.forEach(function(d){
                      i = f.fecha(d.Fecha).isBetween(fi, fc);
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
    
    app.get('/MaraBox/admin/asistencia/:fecha/:hora', function(req, res) {
      
      var e = {};
      var datos = [];
      Clases.find({ Fecha : req.params.fecha, Hora : req.params.hora }, function(err, clase) {
        if (err) return console.error(err);
        else
        {
          console.log(clase);
          if (clase)
          {
            Entrenadores.findById(clase.idEntrenador, function(erre, entrenador) {
              if (erre) return console.error(erre);
              else
              {
                console.log(entrenador);
                if (entrenador)
                {
                  e = entrenador;
                }
              }
            });
            Asistencia.find({ idClase : clase._id }, function(erra, asistencia) {
              if (erra) return console.error(erra);
              else
              {
                console.log(asistencia);
                if (asistencia)
                {
                  asistencia.forEach(function(a){
                    var iu = h.getInfoUsuario(asistencia.idUsuario);
                    datos.push({entrenador:e, cedula:iu[0], nombre:iu[1], apellido:iu[2] });
                  });
                  res.render(base + '/HUB/MaraBox/views/listaAsistenciaClase.ejs', { entrenador : e, asistencia : datos, message: req.flash('loginMessage') });
                }
              }
            });
          }
        }
      });
    });
    
    app.get('/MaraBox/admin/registroAsistencia', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/admin/registroAsistencia', function(req, res) {
        
        var cedula = h.getUserId(cedula);
        if(!cedula)
        {
          res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'El usuario no esta registrado en la base de datos', regman : 1 });
        }
        else
        {
          var idu = h.getUserId(req.body.cedula);
          var solvente = h.verificarSolvencia(idu);
          
          if (solvente)
          {
            var asistencia = new Asistencia();
            asistencia.MaraBox.idUsuario = idu;
            asistencia.MaraBox.idBox = h.getMaraBoxId();
            asistencia.MaraBox.idClase = h.getClaseId(req.body.hora);

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
    
    app.get('/MaraBox/admin/registro/usuario/nuevo', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/registroPrimerUsuario.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/admin/registroPrimerUsuario', function(req, res) {
        console.log(req.body);
        var usuario = Usuario();
        usuario.MaraBox.Cedula = req.body.cedula;
        usuario.save(function(err) {
            if (err) 
              res.render(base + '/HUB/MaraBox/views/registroPrimerUsuario.ejs', { message:'El registro no pudo ser guardado, intente nuevamente' });
            else
              Usuario.findOne({ cedula : req.body.cedula }, function(erru, usuario) {
                if (erru) return console.error(erru);
                else
                {
                  if(usuario)
                  {
                    var info = InfoUsuario();
                    info.MaraBox.Nombres = req.body.nombre;
                    info.MaraBox.Apellidos = req.body.apellido;
                    info.MaraBox.Ciudad = req.body.ciudad;
                    info.MaraBox.Estado = req.body.estado;
                    info.MaraBox.Direccion = req.body.direccion;
                    info.MaraBox.Telefono = req.body.telefono;
                    info.MaraBox.FechaNacimiento = req.body.fechaNacimiento;
                    info.MaraBox.idUsuario = usuario._id;
                    
                    info.save(function(err) {
                        if (err) 
                          res.render(base + '/HUB/MaraBox/views/registroPrimerUsuario.ejs', { message:'El mensaje no pudo ser enviado, intente nuevamente' });
                        else
                          res.render(base + '/HUB/MaraBox/views/registroPrimerUsuario.ejs', { message:'El usuario fue registrado con exito' });
                      });
                  }
                }
              });
          });
    });
    
    app.get('/MaraBox/admin/atletas', function(req, res) {

    });
    
    app.get('/MaraBox/admin/atletas/:id', function(req, res) {

    });
}