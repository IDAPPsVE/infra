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

exports.sendValidationCode = function(to,Validacion){

  var path = process.cwd() + '/IDAPP/views/email/emailValidation.ejs';
  var str = fs.readFileSync(path, 'utf8');

  var renderedHtml = ejs.render(str, {
    validationURL : Validacion,
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

exports.sendValidationCodeMaraBox = function(to,Validacion){

  var path = process.cwd() + '/IDAPP/views/email/emailValidation.ejs';
  var str = fs.readFileSync(path, 'utf8');

  var renderedHtml = ejs.render(str, {
    validationURL : Validacion,
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

exports.sendValidationUsuarioMaraBox = function(to,Validacion){

  var path = process.cwd() + '/IDAPP/views/email/emailValidation.ejs';
  var str = fs.readFileSync(path, 'utf8');

  var renderedHtml = ejs.render(str, {
    validationURL : Validacion,
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

exports.sendWelcomeMsg = function(){}
