var fs = require('fs');
var ejs = require('ejs');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'idapps.ve@gmail.com',
        pass: 'Nexus58613@jc'
    }
});

var from = "idapps.ve@gmail.com";

//Admin y empleado IDAPP, y propietarios de apps
exports.sendValidationCode = function(to,url){

  var path = process.cwd() + '/IDAPP/views/email/emailValidation.ejs';
  var str = fs.readFileSync(path, 'utf8');

  var renderedHtml = ejs.render(str, {
    validationURL : url,
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

//Usuarios finales Marabox
exports.sendValidationCodeMaraBox = function(to,url){

  var path = process.cwd() + '/IDAPP/views/email/emailValidation.ejs';
  var str = fs.readFileSync(path, 'utf8');

  var renderedHtml = ejs.render(str, {
    validationURL : url,
    filename : path
  });

  transporter.sendMail({
    from: from,
    to: to,
    subject: 'Bienvenido a Marabox',
    html: renderedHtml
  }, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
  });
}

exports.sendBoxAndBoxsdminCode = function(to, boxId, boxAdmin)
{
  var path = process.cwd() + '/IDAPP/views/email/emailBoxCodes.ejs';
  var str = fs.readFileSync(path, 'utf8');

  var renderedHtml = ejs.render(str, {
    boxCode  : boxId,
    boxAdmin : boxAdmin,
    filename : path
  });

  transporter.sendMail({
    from: from,
    to: to,
    subject: 'Codigos unicos de Box',
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
