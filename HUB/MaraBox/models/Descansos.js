var mongoose     = require('mongoose');

var DescansosSchema = mongoose.Schema({

    MaraBox : {
         Fecha        : Date,
         DiaCompleto  : Number,
         Hora         : Date,
         Motivo       : String,
    }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Descansos', DescansosSchema);