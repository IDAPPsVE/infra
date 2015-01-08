var mongoose     = require('mongoose');
//var Schema       = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var UsuarioAppSchema = mongoose.Schema({

    Boxes : {
        Cedula       : Number,
        Email        : String,
        Password     : String,
        idBox        : String,
        idBoxCode    : String,
        Tipo         : Number,
    }
});

// methods ======================
// generating a hash
UsuarioAppSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UsuarioAppSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('UsuarioBoxes', UsuarioAppSchema);