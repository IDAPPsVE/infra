var mongoose     = require('mongoose');

// define the schema for our user model
var IngresosSchema = mongoose.Schema({
        IDAPP : {
                Fecha        : Date,
                Razon_Social : String,
                Nombre       : String,
                Direccion    : String,
                Telefono     : String,
                Descripcion  : String,
                Cantidad     : String,
                Subtotal     : String,
                IVA          : String,
                Total        : String
        }
});

var EgresosSchema = mongoose.Schema({

        IDAPP : {
                Fecha        : Date,
                Razon_Social : String,
                Nombre       : String,
                Direccion    : String,
                Telefono     : String,
                Descripcion  : String,
                Cantidad     : String,
                Subtotal     : String,
                IVA          : String,
                Total        : String
        }
        
});

exports.ingresos = mongoose.model('Ingresos', IngresosSchema);
exports.egresos = mongoose.model('Egresos', EgresosSchema);
