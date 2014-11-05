var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UsuarioSchema   = new Schema({
	name: String
});
module.exports = mongoose.model('Usuario', UsuarioSchema);
