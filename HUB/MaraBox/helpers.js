var base = process.env.PWD;

var f = require(base + '/IDAPP/helpers/dates');
var h = require(base + '/HUB/MaraBox/helpers');

var Usuario = require(base + '/HUB/MaraBox/models/Usuarios');
var InfoUsuario = require(base + '/HUB/MaraBox/models/InfoUsuarios');
var Box = require(base + '/IDAPP/models/Boxes');
var WOD = require(base + '/HUB/MaraBox/models/WOD');
var Validacion = require(base + '/HUB/MaraBox/models/ValidacionUsuario');
var Solvencia = require(base + '/HUB/MaraBox/models/Solvencia');
var Descanso = require(base + '/HUB/MaraBox/models/Descansos');
var Clases = require(base + '/HUB/MaraBox/models/Clases');

exports.isLoggedIn = function(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
    {
        return next();
    }
    else
    {
        // if they aren't redirect them to the home page
        return res.redirect('/MaraBox/', { message : 'Debes ingresar para poder acceder a los datos solicitados'});  
    }
    
}

exports.guardarCodigoValidacion = function(id,validacion)
{
  var v = new Validacion(); 		// create a new instance of the Bear model
  v.idUsuario = id;
  v.Codigo = validacion;
  v.idBox = h.getMaraBoxId();
  // save the bear and check for errors
  v.save(function(err) {});
}

exports.getMaraBoxId = function()
{
  Box.findOne({ 'Nombre' : 'MaraBox' }, function(err, box) {
            // if there are any errors, return the error before anything else
            if (err)
                return null;

            return box._id;

        });
}

exports.getUserId = function(cedula)
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

exports.getInfoUsuario = function(usuarioId)
{
  var cedula;
  var datos = [];
 Usuario.findById(usuarioId, function(err, usuario) {
            // if there are any errors, return the error before anything else
            if (err) return null;
            else 
            {
              console.log(usuario);
              if (usuario)
              {
                cedula = usuario.Cedula;
                
                InfoUsuario.find({ idUsuario : usuarioId }, function(erru, info) {
                    if (erru) return null;
                    else 
                    {
                      if (usuario)
                      {
                        datos[0] = cedula;
                        datos[1] = info.Nombre;
                        datos[2] = info.Apellido;
                        console.log(datos);
                        return datos;
                      }
                      else
                      {
                        return null;
                      }
                    }
                });
              }
            }
        }); 
}

exports.getClaseId = function(hora)
{
  Clases.findOne({ 'Fecha' : f.hoy(), 'Hora' :  hora }, function(err, clase) {
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

exports.verificarSolvencia = function(userid)
{
  var solvente = false;
  Solvencia.find({ 'idUsuario' : userid }, function(err, solvencia) {
            // if there are any errors, return the error before anything else
            if (err) return null;
            else
            {
              if(solvencia)
              {
                var fechaMasDias = f.agregarFechas(solvencia.FechaInicio,solvencia.DiasHabiles);
                solvente = f.entre(solvencia.FechaInicio, fechaMasDias);
                return solvente;
              }
              else
              {
                return solvente;
              }
            }
        }); 
}

exports.verificarCierreDelBox = function()
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