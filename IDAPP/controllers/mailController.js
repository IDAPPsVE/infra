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
  transporter.sendMail({
    from: from,
    to: to,
    subject: 'Bienvenido a IDAPP',
    text: 'hello world! From Node.js bitches!'
  }, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
  });
}
exports.sendWelcomeMsg = function(){}
