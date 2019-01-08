var express = require('express');
var router = express.Router();
var db = require('../db');

var config = {
  roles_table : 'Golf_Roles',
  users_table : 'Golf_Users'
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  var params = {
    AttributesToGet : [
      'id',
      'type',
      'name'
     ],
     Select: "SPECIFIC_ATTRIBUTES",
     TableName: config.roles_table
  }

  db.all(params)
    .then(roles =>{
      res.render('roles', { admin : req.session.auth.admin ,title: 'Roles', roles : roles});
    })
    .catch(error=>{
      res.render('error',{message : 'Error while getting roles', error : {stack : error, status : '500'}});
    })
});

router.post('/create',(req,res,next)=>{
  var data = req.body;
  data.id = (Date.now());
  
  db.add({
    'TableName': config.roles_table,
    'Item': data || {}       
  })
  .then(data => {
    res.send(JSON.stringify(data));
  })
  .catch(error=>{
    console.error('<Add role> error:',error);
    res.status(400).json({message : error });
  })

});

router.post('/edit',(req,res,next)=>{
  var data = req.body;

  db.find({TableName : config.roles_table,Value: parseInt(data.id), Key:'id'})
  .then((role) => {
    var up_data = {};

    if(!role || (role && role.length == 0) )
      throw new Error('Role not found');
    
    up_data.id = parseInt(data.id);
    up_data.name = data.name;
    up_data.type = data.type;

    return db.update({TableName : config.roles_table, Key : {id : up_data.id} },up_data);
  })
  .then((resp)=>{
    console.log('resp:',resp)
    res.status(200).json(resp);
  })
  .catch(error=>{
    console.log('<Edit role> error:',error);
    res.status(400).json({message : error.toString()});
  });

});

router.post('/delete',(req,res,next)=>{
  var params = {
    TableName  : config.roles_table,
    Key : {}
  };

  if(req.body.id)
    params.Key.id = parseInt(req.body.id);
  else {
    return res.status(400).json({message : 'There are no provided Role Id'})
  }
  
  db.find({TableName : config.users_table, Value: ''+params.Key.id, Key:'roleid'})
    .then(users => {
      if(users && users.length == 0)
        return db.delete(params);
      return Promise.reject('There are users with this role!');
    })
    .then(()=>{
      res.send('ok');
    })
    .catch(error=>{
      console.log('<Delete user> error:',error);
      res.status(400).json(error);
    })
});

module.exports = router;
