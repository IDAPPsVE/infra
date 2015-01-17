var base = process.env.PWD;

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
    
    //////////////////////////////////////////////////////
    // API
    //////////////////////////////////////////////////////
    
    /*app.get('/MaraBox/api/prueba'), function(req, res)
    {
        return res.json({ code:'200', message:'Hola!' });
    }*/
    
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
            email.sendValidationUsuarioMaraBox(user.Email,url);      
            
            return res.json({ code:'200', message:'Su registro ha sido guardado con exito, debe validar su correo para poder utilizar la app' });
          }
        })(req, res, next);
    });
    
    app.post('/MaraBox/api/login', function(req, res,next) {
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
              return res.json({code:'200','data':userNeededData});
            }
        });
      })(req, res, next);
    });
    
    app.get('/MaraBox/api/logout', function(req, res) {
        req.logout();
        res.json({ code : '200', message: 'Sesion terminada' });
    });
    
    app.post('/MaraBox/api/validarAsistencia/:idClase/:idUsuario', function(req, res) {
        Asistencia.findOne({ idClase : req.params.idClase, idUsuario : req.params.idUsuario }, function(err, asistencia) {
          if (err)
          {
            return res.json({ code : '-1000', message: 'No se pudo recibir los datos correctamente, intente de nuevo'});
          }
          else
          {
            if (asistencia)
            {
              asistencia.Validado = 1;
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
    
    app.get('/MaraBox/api/clase/:hora', function(req, res) {
        
        var totalAsistentes = 0;
        var disponible = 0;
        var listaEspera = 0;
      
        var e = {};
          Clases.find({ Fecha : f.hoy(), Hora : req.params.hora }, function(err, clase) {
            if (err) return console.error(err);
            else
            {
              if (clase)
              {
                Entrenadores.findById(clase.idEntrenador, function(erre, entrenador) {
                  if (erre) return console.error(erre);
                  else
                  {
                    if (entrenador)
                    {
                      e = entrenador;
                    }
                  }
                });
                
                Asistencia.find({ idClase : clase._id }).sort({ Creado: 1 }).count(function(err, c)
                {
                   console.log('Count is ' + c);
                   totalAsistentes = c;
                });
                
                disponible = clase.Cupo - totalAsistentes;
                if (disponible === 0)
                {
                    disponible = 0;
                }
                else if (disponible < 0)
                {
                    listaEspera = -1 * disponible;
                }
                
                res.render(base + '/HUB/MaraBox/views/listaAsistenciaClase.ejs', { entrenador : e, disponible : disponible, listaEspera : listaEspera, message: req.flash('loginMessage') });
              }
            }
          });  
    });
    
    app.post('/MaraBox/api/asistencia', function(req, res) {
      var idu = h.getUserId(req.body.cedula);
      var solvente = h.verificarSolvencia(idu);
          
      if (solvente)
      {
        var asistencia = new Asistencia();
        asistencia.MaraBox.idUsuario = idu;
        asistencia.MaraBox.idBox = h.getMaraBoxId();
        asistencia.MaraBox.idClase = h.getClaseId(req.body.hora);

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
    
    app.get('/MaraBox/api/ejercicios', function(req, res) 
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
    
    app.get('/MaraBox/api/ejercicios/:idEjercicio', function(req, res) 
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
    
    app.get('/MaraBox/api/WOD', function(req, res) {
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