var mongoose     = require('mongoose');
//var Schema       = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var UsuarioSchema = mongoose.Schema({

        Email        : String,
        Password     : String,
        Contrato     : String,
        Tipo         : Number,
});

// methods ======================
// generating a hash
UsuarioSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UsuarioSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.Password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Usuario', UsuarioSchema);
