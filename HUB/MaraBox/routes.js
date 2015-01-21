var express  = require('express');
var base = process.env.PWD;

var busboy = require('connect-busboy');
var fs = require('fs-extra');

var moment = require('moment');
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

var dominio = "http://infra-idappsve-1.c9.io"

module.exports = function(app,passport) {

    app.use('/public', express.static(base + '/HUB/MaraBox/public'));

    //=========================================================
    //          Pagina de inicio y Perfiles de Usuario
    //=========================================================
    app.get('/MaraBox/', function(req, res) {
      res.render(base + '/HUB/MaraBox/views/index.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/', function(req, res) {
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

    app.get('/MaraBox/logout', function(req, res) {
        req.logout();
        res.redirect('/MaraBox/');
    });
    
    // process the login form
    app.post('/MaraBox/login', function(req, res,next) {
      passport.authenticate('local-loginMaraBoxAdmin', function(err, user, info) {
        var userNeededData = {'id':user._id,
                              'Email':user.Email,
                              'Tipo':user.Tipo,
                              'isLoggedIn':'1'};
        req.login(userNeededData, function(err) {
          if (err) { return next(err); }
          else
          {
            res.render(base + '/HUB/MaraBox/views/registrarInfoPersonal.ejs', { idUsuario : user._id, message: "El usuario fue registrado con exito, para finalizar regitra tu informacion personal" });
          }
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
        console.log(err,user,info);
        if (user)
        {
          var randomString = rs.randomString(20);
          h.guardarCodigoValidacion(user._id, randomString);
          var url = dominio + '/MaraBox/ValidacionUsuario/' + randomString;
          console.log(url);
          email.sendValidationCode(user.Email,url);
          if (err){}
          else
          {
            res.render(base + '/HUB/MaraBox/views/registrarInfoPersonal.ejs', { idUsuario : user._id, message: "El usuario fue registrado con exito, para finalizar regitra tu informacion personal" });
          }  
        }
        else
        {
          res.render(base + '/HUB/MaraBox/views/signup.ejs', { message: info });
        }
      })(req, res, next);
    });

    app.get('/MaraBox/registroInfoUsuario', function(req, res) {
      res.render(base + '/HUB/MaraBox/views/registrarInfoPersonal.ejs', { idUsuario : '', message: req.flash('loginMessage') });
    });
    
    app.post('/MaraBox/registroInfoUsuario', function(req, res) {

      var info = new InfoUsuario(); 		// create a new instance of the Bear model
      info.MaraBox.idUsuario = req.body.id;
      info.MaraBox.Nombres = req.body.nombres;
      info.MaraBox.Apellidos = req.body.apellidos;
      info.MaraBox.Ciudad = req.body.ciudad;
      info.MaraBox.Estado = req.body.estado;
      info.MaraBox.Direccion = req.body.estado;
      info.MaraBox.Telefono = req.body.telefono;
      info.MaraBox.FechaNacimiento = req.body.fechaNacimiento;
      
      // save the bear and check for errors
      info.save(function(err) {
        if (err)
        {
          res.render(base + '/HUB/MaraBox/views/registrarInfoPersonal.ejs', { message:'El mensaje no pudo ser enviado, intente nuevamente' });
        }
        else
        {
          res.redirect('/MaraBox/');
        }
      });
    });


    //=========================================================
    //            Validacion de cuentas de usuario
    //=========================================================


    app.get('/MaraBox/ValidacionUsuario/:codigoValidacion', function(req, res) {
        Validacion.findOne({ 'MaraBox.Codigo' : req.params.codigoValidacion },function(err, validacion) {
          if (err) return console.error(err);
          else
          {
            validacion.MaraBox.CorreoValidado = 1;
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

      Validacion.findOne({ 'MaraBox.Codigo' : req.body.codigo },function(errv, validacion) {
          if (errv) return console.error(errv);
          else
          {
            Usuario.findById( validacion.idUsuario,function(erru, usuario) {
              if (erru) return console.error(erru);
              else
              {
                if (usuario.Cedula == req.body.cedula)
                {
                  validacion.MaraBox.CedulaValidada = 1;
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

      //{ $and: [ { _id: someId }, { _id: anotherId } ] }
      Usuario.find({ $or: [ { 'MaraBox.Tipo' : 4 }, { 'MaraBox.Tipo' : 5 }, { 'MaraBox.Tipo' : 6 } ]}, function(erru, usuario) {
          if (usuario)
          {
            var i = 0;
            usuario.forEach(function(u){
              InfoUsuario.findOne({ 'MaraBox.idUsuario' : u._id }, function(err, info) {
                  if (err) return null;
                  else 
                  {
                    if (info === null)
                    {
                      if (u.MaraBox.Tipo === 4)
                      {
                        u4.push({cedula:u.MaraBox.Cedula, nombre:"", apellido:"" });
                      }
                      if (u.MaraBox.Tipo === 5)
                      {
                        u5.push({cedula:u.MaraBox.Cedula, nombre:"", apellido:"" });
                      }
                      if (u.MaraBox.Tipo === 6)
                      {
                        u6.push({cedula:u.MaraBox.Cedula, nombre:"", apellido:"" });
                      }
                    }
                    else
                    {
                      if (u.MaraBox.Tipo === 4)
                      {
                        u4.push({cedula:u.MaraBox.Cedula, nombre:info.MaraBox.Nombres, apellido:info.MaraBox.Apellidos });
                      }
                      if (u.MaraBox.Tipo === 5)
                      {
                        u5.push({cedula:u.MaraBox.Cedula, nombre:info.MaraBox.Nombres, apellido:info.MaraBox.Apellidos });
                      }
                      if (u.MaraBox.Tipo === 6)
                      {
                        u6.push({cedula:u.MaraBox.Cedula, nombre:info.MaraBox.Nombres, apellido:info.MaraBox.Apellidos });
                      }
                    }
                    i++;
                    if (i === usuario.length)
                    {
                      res.render(base + '/HUB/MaraBox/views/usuariosConPermisos.ejs', { superU : u4, admin : u5, coach : u6, message: req.flash('loginMessage') });
                    }
                  }
              });
            });
          }
      });
    });

    app.get('/MaraBox/super/cambiarPermisos', function(req, res) {
      var u5 = [];
      var u6 = [];
      Usuario.find({ $or: [ { 'MaraBox.Tipo' : 5 }, { 'MaraBox.Tipo' : 6 } ]}, function(erru, usuario) {
          if (usuario)
          {
            var i = 0;
            usuario.forEach(function(u){
              InfoUsuario.findOne({ 'MaraBox.idUsuario' : u._id }, function(err, info) {
                  if (err) return null;
                  else 
                  {
                    if (info === null)
                    {
                      if (u.MaraBox.Tipo === 5)
                      {
                        u5.push({id:u._id, cedula:u.MaraBox.Cedula, nombre:"", apellido:"" });
                      }
                      if (u.MaraBox.Tipo === 6)
                      {
                        u6.push({id:u._id, cedula:u.MaraBox.Cedula, nombre:"", apellido:"" });
                      }
                    }
                    else
                    {
                      if (u.MaraBox.Tipo === 5)
                      {
                        u5.push({id:u._id, cedula:u.MaraBox.Cedula, nombre:info.MaraBox.Nombres, apellido:info.MaraBox.Apellidos });
                      }
                      if (u.MaraBox.Tipo === 6)
                      {
                        u6.push({id:u._id, cedula:u.MaraBox.Cedula, nombre:info.MaraBox.Nombres, apellido:info.MaraBox.Apellidos });
                      }
                    }
                    i++;
                    if (i === usuario.length)
                    {
                      res.render(base + '/HUB/MaraBox/views/cambiarPermisos.ejs', { admin : u5, coach : u6, message: req.flash('loginMessage') });
                    }
                  }
              });
            });
          }
      });
    });

    app.post('/MaraBox/super/cambiarPermisos', function(req, res) {
      
      console.log("Tipo", req.body.tipo);
      if ( req.body.tipo === '6' )
      {
        console.log("Guardando entrenador");
        var e = new Entrenadores();
        e.MaraBox.Nombre = req.body.nombre;
        e.MaraBox.Apellido = req.body.apellido;
        e.MaraBox.idUsuario = req.body.id;
        e.save(function(e){
          if (e){}
          else{
            console.log("Entrenador guardado");
          }
        });
        Usuario.findById(req.body.id, function(erru, usuario) {
           usuario.MaraBox.Tipo = req.body.tipo;
           usuario.save(function(err) {
             if (err){}
             else
             {
               return res.redirect('/MaraBox/super/cambiarPermisos');
             }
           });
        });
      }
      else
      {
        Usuario.findById(req.body.id, function(erru, usuario) {
           usuario.MaraBox.Tipo = req.body.tipo;
           usuario.save(function(err) {
             if (err){}
             else
             {
                return res.redirect('/MaraBox/super/cambiarPermisos');
             }
           });
        });
      }
      
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
            //res.end();
          }
          else
          {
            res.render(base + '/HUB/MaraBox/views/nuevoEvento.ejs', { message: 'El evento fue guardado con exito' });
            // Enviar a todas las plataformas via push notifications
            //res.end();
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
        var userid;
        var dh = 0;
        var fi = moment(new Date(req.body.fechaInicio));
        var fc = moment(new Date(req.body.fechaCulminacion));

        var totalDias = fc.diff(fi, 'days');

        Usuario.findOne({ 'MaraBox.Cedula' :  cedula }, function(err, usuario) {
            // if there are any errors, return the error before anything else
            if (err) return null;
            else 
            {
              if (usuario)
              {
                userid = usuario._id;
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
  
                var dis = totalDias + dh;
                console.log(userid, req.body.fechaInicio, req.body.fechaCulminacion, dis);
                
                var solvencia = new Solvencia(); 		// create a new instance of the Bear model
                  solvencia.MaraBox.idUsuario = userid;
                  solvencia.MaraBox.FechaInicio = req.body.fechaInicio;
                  solvencia.MaraBox.FechaCulminacion = req.body.fechaCulminacion;
                  solvencia.MaraBox.DiasHabiles = dis;
        
                  // save the bear and check for errors
                  solvencia.save(function(err) {
                    if (err)
                    {
                      res.render(base + '/HUB/MaraBox/views/registroSolvencia.ejs', { message:'El mensaje no pudo ser enviado, intente nuevamente' });
                    }
                    else
                    {
                      res.render(base + '/HUB/MaraBox/views/registroSolvencia.ejs', { message:'Registro guardado con exito' });
                    }
        
                      // Enviar a todas las plataformas via push notifications
                  });
              }
            }
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
      var fecha = req.params.fecha;
      
      //Ver wod del dia en la fecha seleccionada
      Entrenadores.find(function(err, coach) {
        if (err) return console.error(err);
        else
        {
          if (coach)
          {
            res.render(base + '/HUB/MaraBox/views/asignacionCoach.ejs', { fecha : fecha, entrenadores : coach, message: req.flash('loginMessage') });
          }
        }
      });
    });

    app.post('/MaraBox/admin/:fecha', function(req, res) {
      var fecha = req.body.fecha;
      
      console.log("Guardando clase");
      var c = new Clases();
      c.MaraBox.idEntrenador = req.body.entrenador;
      c.MaraBox.Fecha = moment(req.body.fecha, 'DD-MM-YYYY');
      c.MaraBox.Hora = req.body.hora;
      c.save(function(err) {
            if (err)
            {
              console.log("error guardando clase", err);
              res.redirect('/MaraBox/admin/'+fecha);
            }
            else
            {
              Entrenadores.find(function(err, coach) {
                if (err) return console.error(err);
                else
                {
                  if (coach)
                  {
                    res.redirect('/MaraBox/admin/'+fecha);
                  }
                }
              });
            }
          });
    });

    app.get('/MaraBox/admin/asistencia/:fecha/:hora', function(req, res) {

      var e = {};
      var datos = [];
      
      Clases.find({ 'MaraBox.Fecha' : moment(req.params.fecha, 'DD-MM-YYYY'), 'MaraBox.Hora' : req.params.hora }, function(err, clase) {
        if (err) return console.error(err);
        else
        {
          if (clase === null)
          {
            return res.render('/MaraBox/admin/asistencia/' + moment(req.params.fecha).format('DD-MM-YYYY') + '/' +req.params.hora);
          }
          else
          {
            Entrenadores.findById(clase[0].MaraBox.idEntrenador, function(erre, entrenador) {
              if (erre) return console.error(erre);
              else
              {
                console.log("Entrenado", entrenador);
                if (entrenador)
                {
                  e = entrenador;
                  var i = 0;
                  Asistencia.find({ 'MaraBox.idClase' : clase[0]._id }, function(erra, asistencia) {
                    if (erra) return console.error(erra);
                    else
                    {
                      var al = asistencia.length;
                      console.log("Asistencia", asistencia);
                      if (asistencia)
                      {
                        asistencia.forEach(function(a){
                          Usuario.findById(a.MaraBox.idUsuario, function(erru, u) {
                            if (erru)
                            {
                            }
                            console.log("Usuario", u);
                            if (u)
                            {
                              InfoUsuario.findOne({ 'MaraBox.idUsuario' : u._id }, function(err, info) {
                                console.log("Info usuario",info);
                                if (err) return null;
                                else 
                                {
                                  if (info === null)
                                  {
                                    datos.push({ cedula:u.MaraBox.Cedula, nombre:"", apellido:"" });
                                  }
                                  else
                                  {
                                    datos.push({ cedula:u.MaraBox.Cedula, nombre:info.MaraBox.Nombres, apellido:info.MaraBox.Nombres });
                                  }
                                  i++;
                                  console.log(i,al);
                                  if (i === al)
                                  {
                                    res.render(base + '/HUB/MaraBox/views/listaAsistenciaClase.ejs', { fecha : req.params.fecha, hora : req.params.hora, entrenador : e, asistencia : datos, message: req.flash('loginMessage') });
                                  }
                                }
                              });
                            }
                          });
                        });
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    });

    app.get('/MaraBox/admin/clase/asistencia/registro/manual', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/MaraBox/admin/clase/asistencia/registro/manual', function(req, res) {
        Usuario.findOne({ 'MaraBox.Cedula' : req.body.cedula }, function(erru, u) {
          console.log("Usuario",u);
          if (erru){}
          if (u)
          {
            if (u.MaraBox.Cedula)
            {
              var idu = u._id;
              Solvencia.findOne({ 'MaraBox.idUsuario' : idu }, function(errs, solvencia) {
                console.log("Solvencia",solvencia);
                if (errs) return null;

                if(solvencia)
                {
                  var fechaMasDias = f.agregarFechas(solvencia.MaraBox.FechaInicio,solvencia.MaraBox.DiasHabiles);
                  var solvente = f.entre(solvencia.MaraBox.FechaInicio, fechaMasDias);
                  if (solvente)
                  {
                    Box.findOne({ 'IDAPP.Nombre' : 'MaraBox' }, function(errb, box) 
                    {
                      console.log("Box",box);
                        if (errb)
                        {
                          return null;
                        }
                        if(box)
                        {
                          Clases.findOne({ 'MaraBox.Fecha' : moment(moment().format('YYYY-MM-DD')), 'MaraBox.Hora' :  req.body.hora }, function(errc, clase) {
                            if (errc) return null;
                            else 
                            {
                              if (clase)
                              {
                                var asistencia = new Asistencia();
                                asistencia.MaraBox.idUsuario = idu;
                                asistencia.MaraBox.idBox = box._id;
                                asistencia.MaraBox.idClase = clase._id;
                    
                                // save the bear and check for errors
                                asistencia.save(function(err) {
                                  if (err)
                                    res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'El usuario no pudo ser registrado', regman : 0 });
                                  else
                                    res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'Usuario registrado para el entrenamiento del dia de hoy a las '+req.body.hora, regman : 0 });
                                });
                
                              }
                              else
                              {
                                res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'Disculpe, pero no hay clase abierta para la hora indicada en el sistema, favor comunicarse con el box.', regman : 0 });
                              }
                            }
                          });
                        }
                    });
                  }
                  else
                  {
                    res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'El usuario no aparece registrado en el registro de solvencias del Box, por favor actualice los datos de la solvencia del usuario para poder continuar con el registro.', regman : 2});
                  }
                }
                
            });
              
            }
            else
            {
              res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'El usuario no esta registrado en la base de datos', regman : 1 });
            }
          }
        });
    });

    app.get('/MaraBox/admin/registro/usuario/nuevo', function(req, res) {
        res.render(base + '/HUB/MaraBox/views/registroPrimerUsuario.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/MaraBox/admin/registro/usuario/nuevo', function(req, res) {
        var usuario = Usuario();
        usuario.MaraBox.Cedula = req.body.cedula;
        usuario.MaraBox.Tipo = 10;
        usuario.save(function(err) {
            if (err)
              res.render(base + '/HUB/MaraBox/views/registroPrimerUsuario.ejs', { message:'El registro no pudo ser guardado, intente nuevamente' });
            else
              Usuario.findOne({ 'MaraBox.Cedula' : req.body.cedula }, function(erru, usuario) {
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
    




    //////////////////////////////////////////////////////
    // API
    //////////////////////////////////////////////////////
    app.post('/MaraBox/api/signup', function(req, res,next) {
      passport.authenticate('local-signupMaraBox', function(err, user, info) {
          if (err)
          {
            return res.json({ code:'-1000', message:'Ha ocurrido un error, por favor intente de nuevo' });
          }
          if (user)
          {
            var randomString = rs.randomString(10);
            h.guardarCodigoValidacion(user._id, randomString);
            var url = "/MaraBox/ValidacionUsuario/"+randomString;
            console.log(url);
            email.sendValidationUsuarioMaraBox(user.Email,url);

            return res.json({ code:'200', message:'Su registro ha sido guardado con exito, debe validar su correo para poder utilizar la app' });
          }
        })(req, res, next);
    });

    app.post('/MaraBox/api/login', function(req, res, next) {
      return res.json({code:'200'});
      /*passport.authenticate('local-loginMarabox', function(err, user, info) {

        var userNeededData = {'id':user._id,
                              'Email':user.Email,
                              'Tipo':user.Tipo,
                              'isLoggedIn':'1'};
        req.login(userNeededData, function(err) {
          if (err) { return next(err); }

            if(user.Tipo == 10)
            {
              return res.json({code:'200','data':userNeededData});
            }
        });
      })(req, res, next);*/
    });

    app.get('/MaraBox/api/logout', function(req, res) {
        req.logout();
        res.json({ code : '200', message: 'Sesion terminada' });
    });

    app.post('/MaraBox/api/validarAsistencia', function(req, res) {
        Asistencia.findOne({ 'MaraBox.idClase' : req.body.idClase, 'MaraBox.idUsuario' : req.body.idUsuario }, function(err, asistencia) {
          if (err)
          {
            return res.json({ code : '-1000', message: 'No se pudo recibir los datos correctamente, intente de nuevo'});
          }
          else
          {
            if (asistencia)
            {
              asistencia.MaraBox.Validado = 1;
              asistencia.save(function(err){
                if (err)
                {

                }
                else
                {
                  return res.json({ code : '200', message : ''});
                }
              });
            }
          }
        })
    });

    app.get('/MaraBox/api/clase', function(req, res) {
        var totalAsistentes = 0;
        var disponible = 0;
        var listaEspera = 0;

        var e = {};
          Clases.findOne({ 'MaraBox.Fecha' : moment(moment().format('YYYY-MM-DD')), 'MaraBox.Hora' : "06:00" }, function(err, clase) {
            if (err) return console.error(err);
            else
            {
              if (clase)
              {
                Entrenadores.findById(clase.MaraBox.idEntrenador, function(erre, entrenador) {
                  if (erre) return console.error(erre);
                  else
                  {
                    if (entrenador)
                    {
                      e = entrenador;
                      Asistencia.find({ 'MaraBox.idClase' : clase._id }).count(function(erra, c)
                      {
                         totalAsistentes = c;
                         disponible = clase.MaraBox.Cupo - totalAsistentes;
                          if (disponible === 0)
                          {
                              disponible = 0;
                          }
                          else if (disponible < 0)
                          {
                              listaEspera = -1 * disponible;
                          }
                          return res.json( { entrenador : { nombre : e.MaraBox.Nombre, apellido : e.MaraBox.Apellido, certificado : e.MaraBox.Certificado }, cupo : clase.MaraBox.Cupo, disponible : disponible, listaEspera : listaEspera, message: req.flash('loginMessage') });
                      });
                    }
                  }
                });
              }
            }
          });
    });
    
    app.post('/MaraBox/api/asistencia/registrar', function(req, res) {
        Usuario.findOne({ 'MaraBox.Cedula' : req.body.cedula }, function(erru, u) {
          console.log("Usuario",u);
          if (erru){}
          if (u)
          {
            if (u.MaraBox.Cedula)
            {
              var idu = u._id;
              Solvencia.findOne({ 'MaraBox.idUsuario' : idu }, function(errs, solvencia) {
                console.log("Solvencia",solvencia);
                if (errs) return null;

                if(solvencia)
                {
                  var fechaMasDias = f.agregarFechas(solvencia.MaraBox.FechaInicio,solvencia.MaraBox.DiasHabiles);
                  var solvente = f.entre(solvencia.MaraBox.FechaInicio, fechaMasDias);
                  if (solvente)
                  {
                    Box.findOne({ 'IDAPP.Nombre' : 'MaraBox' }, function(errb, box) 
                    {
                      console.log("Box",box);
                        if (errb)
                        {
                          return null;
                        }
                        if(box)
                        {
                          Clases.findOne({ 'MaraBox.Fecha' : moment(moment().format('YYYY-MM-DD')), 'MaraBox.Hora' :  req.body.hora }, function(errc, clase) {
                            if (errc) return null;
                            else 
                            {
                              if (clase)
                              {
                                var asistencia = new Asistencia();
                                asistencia.MaraBox.idUsuario = idu;
                                asistencia.MaraBox.idBox = box._id;
                                asistencia.MaraBox.idClase = clase._id;
                    
                                // save the bear and check for errors
                                asistencia.save(function(err) {
                                  if (err){}
                                  else return res.json({ code : '200', message : 'Usuario registrado para el entrenamiento del dia de hoy a las '+req.body.hora});
                                    
                                });
                
                              }
                              else
                              {
                                return res.json({ code : '-100', message:'Disculpe, pero no hay clase abierta para la hora indicada en el sistema, favor comunicarse con el box.'});
                              }
                            }
                          });
                        }
                    });
                  }
                  else
                  {
                    return res.json({ code : '-1000', message:'El usuario no aparece registrado en el registro de solvencias del Box, por favor dirijase a caja para solventar este problema', regman : 2});
                  }
                }
                
            });
              
            }
            else
            {
              res.render(base + '/HUB/MaraBox/views/registroAsistencia.ejs', { message:'El usuario no esta registrado en la base de datos', regman : 1 });
            }
          }
        });
    });
    
    app.post('/MaraBox/api/asistencia/cancelar', function(req, res) {
      
    });
    
    app.post('/MaraBox/api/ejercicios', function(req, res)
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

    app.post('/MaraBox/api/ejercicios/detalle', function(req, res)
    {
      Ejercicios.findOne({ 'MaraBox.Email' :  req.body.idEjercicio }, function(errE, ejercicio) {
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

    app.post('/MaraBox/api/WOD', function(req, res) {
        WOD.findOne({ 'MaraBox.Fecha' : moment(moment().format('YYYY-MM-DD')) },function(errE, wod) {
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

    app.get('/MaraBox/api/eventos', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });
    app.post('/MaraBox/api/:evento/asistir', function(req, res) {

    });
    app.post('/MaraBox/api/registroRM', function(req, res) {

    });
    app.get('/MaraBox/api/progreso', function(req, res) {

    });
    
}