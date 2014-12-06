var mongoose     = require('mongoose');

// define the schema for our user model
var FeedbackSchema = mongoose.Schema({

    MaraBox : {
        Email        : String,
        idUsuario     : String,
        Mensaje      : String,
        Fecha        : Date
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Feedback', FeedbackSchema);