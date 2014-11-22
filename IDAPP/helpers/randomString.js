var crypto = require('crypto');

/** Sync */
function randomStringGenerator(length, chars) {
  if(!chars) {
    throw new Error('Argument \'chars\' is undefined');
  }

  var charsLength = chars.length;
  if(charsLength > 256) {
    throw new Error('Argument \'chars\' should not have more than 256 characters'
    + ', otherwise unpredictability will be broken');
  }

  var randomBytes = crypto.randomBytes(length)
  var result = new Array(length);

  var cursor = 0;
  for (var i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % charsLength]
  };

  return result.join('');
}

/** Sync */
exports.randomString = function(length){
  return randomStringGenerator(length,
    'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789');
  }
