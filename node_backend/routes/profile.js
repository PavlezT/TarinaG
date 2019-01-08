var express = require('express');
var router = express.Router();
var db = require('../db');

var config = {
  users_table : 'Golf_Users',
  roles_table : 'Golf_Roles'
}

router.get('/', (req,res) => {
    db.find({TableName : config.users_table,Value: parseInt(req.session.auth.userid),Key:'id'})
    .then((user) => {
        if( !(user && user[0]) )
            throw new Error('There is no user');

        req.session.auth.name = user[0].name;
        req.session.auth.email = user[0].email;
        res.render('profile', { admin : req.session.auth.admin, user : user[0] , action : req.query.action });
    })
    .catch(error =>{
        res.render('error',{message : 'Error while getting profile', error : {stack : error, status : '500'}});
    })
})


router.post('/edit',(req,res)=>{
    var data = req.body;
    data.id = req.session.auth.userid;
    
    db.find({TableName : config.users_table,Value: parseInt(data.id),Key:'id'})
    .then((user) => {
      var up_data = {};
  
      if(!user || (user && user.length == 0) )
        throw new String('User not found');
  
      if(data.old_pass && data.new_pass && data.old_pass.length > 1 && data.new_pass.length > 1){
        if(user[0].password == data.old_pass && (data.new_pass == data.copy_pass)){
          up_data.password = data.new_pass;
        } else {
          throw new String('password');
        }
      }
      
      up_data.id = parseInt(data.id);
      up_data.name = data.name;
      up_data.email = data.email;
    //   up_data.roleid = data.roleid;
    //   up_data.role = data.role;
  
      return db.update({TableName : config.users_table, Key : {id : up_data.id} },up_data);
    })
    .then((resp)=>{
        console.log('resp:',resp)
        res.redirect('/profile?action=true');
    })
    .catch(error=>{
        console.log('<Edit profile user> error:',error);
        res.redirect(`/profile?action=${(error && error.toString() == 'password' ? 'fill' : false)}`);
    });

});

module.exports = router;