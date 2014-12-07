var mongoose     = require('mongoose');

// define the schema for our user model
var FeedbackAppSchema = mongoose.Schema({

        IDAPP : {
                Email        : String,
                idBox        : String,
                idUsuario    : String,
                Mensaje      : String,
                Fecha        : Date
        }
        
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Feedback', FeedbackAppSchema);