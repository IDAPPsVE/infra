var mongoose     = require('mongoose');

var BoxCodeSchema = mongoose.Schema({

  Codigo      : String,
  idBox       : String
});

module.exports = mongoose.model('BoxCode', BoxCodeSchema);