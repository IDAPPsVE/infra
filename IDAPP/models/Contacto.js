var mongoose     = require('mongoose');

// define the schema for our user model
var ContactoSchema = mongoose.Schema({
        IDAPP : {
                Email        : String,
                Nombre       : String,
                Apellido     : String,
                Mensaje      : String,
                Fecha        : Date
        }
        
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Contacto', ContactoSchema);
