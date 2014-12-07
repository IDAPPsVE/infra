var mongoose     = require('mongoose');

var ContratosSchema = mongoose.Schema({

  IDAPP : {
    Contrato          : String,
    Android           : Number,
    iOS               : Number,
    Administrativo    : Number,
    Facturacion       : String,
    RIF               : String,
    Empresa           : String,
    Telefono_Oficina  : Number,
    Telefono_Personal : Number,
    Direccion         : String,
    Fecha_Contrato    : Date,
    Fecha_Facturacion : Date,
    Nombre_APP        : String,
    Firmantes         : Number,
    Cedula_Firmantes  : [],
  }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Contratos', ContratosSchema);