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
    Correo_Contacto   : String,
    Fecha_Contrato    : {type: Date, default: Date.now },
    Nombre_APP        : String,
    Firmantes         : Number,
    Cedula_Firmantes  : [mongoose.Schema.Types.Mixed],
  }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Contratos', ContratosSchema);
