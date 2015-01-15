var moment = require('moment');

function hoy()
{
  return moment(new Date()).format("DD-MM-YYYY");
}

function fecha(fecha)
{
    return moment(fecha);
}

function formatearFecha(fecha)
{
  return moment(fecha).format("DD-MM-YYYY");
}

function agregarFechas(fecha,dias)
{
    var duration = moment.duration({'days' : dias});
    return moment(fecha).add(duration);
}

function entre(fi,fc)
{
    return moment().isBetween(fi, fc);    
}

//Exportar
exports.hoy = function(){
    return hoy();
}

exports.fecha = function(fecha){
    return fecha(fecha);
}

exports.agregarFechas = function(fecha,dias)
{
    return agregarFechas(fecha,dias);
}

exports.formatearFecha = function(fecha)
{
    return formatearFecha(fecha);
}

exports.entre = function(fi,fc)
{
    return entre(fi,fc);
}