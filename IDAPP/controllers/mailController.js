var rs = require('../helpers/randomString');
var fs = require('fs');
var ejs = require('ejs');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'vjfs18@gmail.com',
        pass: 'Taberusan1989'
    }
});

var from = "vjfs18@gmail.com";

exports.sendValidationCode = function(to){

  var path = process.cwd() + '/IDAPP/views/email/emailValidation.ejs';
  var str = fs.readFileSync(path, 'utf8');
  var randomString = rs.randomString(20);

  console.log(randomString);
  var renderedHtml = ejs.render(str, {
    validationURL : randomString,
    filename : path
  });

  transporter.sendMail({
    from: from,
    to: to,
    subject: 'Bienvenido a IDAPP',
    html: renderedHtml
  }, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
  });
}
exports.sendWelcomeMsg = function(){}