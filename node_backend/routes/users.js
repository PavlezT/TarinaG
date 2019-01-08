var express = require('express');
var router = express.Router();
var db = require('../db');

var config = {
  users_table : 'Golf_Users',
  roles_table : 'Golf_Roles'
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  var params = {
     AttributesToGet : [
      'id',
      'email',
      'admin',
      'roleid',
      // 'role',
      'name'
     ],
     Select: "SPECIFIC_ATTRIBUTES",
     TableName: config.users_table
  };


  var params2 = {
    AttributesToGet : [
      'id',
      'type',
      'name'
     ],
     Select: "SPECIFIC_ATTRIBUTES",
     TableName: config.roles_table
  }


  Promise.all([db.all(params),db.all(params2)])
    .then(([users,roles])=>{

      users.filter(user => {
        roles.map(role => {
          if(role.id == user.roleid){
            user.role = role.name;
          }
        })
      });

      res.render('users', { admin : req.session.auth.admin, title: 'Users', users : users , roles : roles});
    })
    .catch(error=>{
      res.render('error',{message : 'Error while getting users', error : {stack : error, status : '500'}});
    })
});

router.post('/create',(req,res,next)=>{
  var data = req.body;
  data.id = (Date.now());
  
  db.add({
    'TableName': config.users_table,
    'Item': data || {}       
  })
  .then(data => {
    res.send(JSON.stringify(data));
  })
  .catch(error=>{
    console.error('<Add notification> error:',error);
    res.status(400).json({message : error });
  })

});

router.post('/edit',(req,res,next)=>{
  var data = req.body;

  db.find({TableName : config.users_table,Value: parseInt(data.id),Key:'id'})
  .then((user) => {
    var up_data = {};

    if(!user || (user && user.length == 0) )
      throw new Error('User not found');

    if(data.old_pass && data.new_pass){
      if(user[0].password == data.old_pass){
        up_data.password = data.new_pass;
      } else {
        throw new Error('Old Password don`t match');
      }
    }
    
    up_data.id = parseInt(data.id);
    up_data.name = data.name;
    up_data.email = data.email;
    up_data.roleid = data.roleid;
    up_data.role = data.role;

    return db.update({TableName : config.users_table, Key : {id : up_data.id} },up_data);
  })
  .then((resp)=>{
    console.log('resp:',resp)
    res.status(200).json(resp);
  })
  .catch(error=>{
    console.log('<Edit user> error:',error);
    res.status(400).json({message : error.toString()});
  });

});

router.post('/delete',(req,res,next)=>{
  var params = {
    TableName  : config.users_table,
    Key : {}
  };

  if(req.body.id)
    params.Key.id = parseInt(req.body.id);
  else {
    return res.status(400).json({message : 'There are not provided User Id'})
  }
  
  db.delete(params)
    .then(()=>{
      res.send('ok');
    })
    .catch(error=>{
      console.log('<Delete user> error:',error);
      res.status(400).json(error);
    })
});

module.exports = router;
