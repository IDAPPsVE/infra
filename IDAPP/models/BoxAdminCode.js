var mongoose     = require('mongoose');

var BoxAdminCodeSchema = mongoose.Schema({
  IDAPP : {
    Codigo      : String,
    idBox       : String
  }
});

module.exports = mongoose.model('BoxAdminCode', BoxAdminCodeSchema);
