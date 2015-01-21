var mongoose     = require('mongoose');
//var Schema       = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var UsuarioInfraSchema = mongoose.Schema({

        IDAPP : {
            Email        : String,
            Password     : String,
            Tipo         : Number,
        }
        
});

// methods ======================
// generating a hash
UsuarioInfraSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UsuarioInfraSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.IDAPP.Password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('UsuarioInfra', UsuarioInfraSchema);