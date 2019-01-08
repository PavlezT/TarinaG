var express = require('express');
var router = express.Router();
var db = require('../db');

var config = {
  notif_table : 'Golf_Notifications',
  apps_table : 'Golf_Apps',
}

router.get('/', function(req, res, next) {
  Promise.all([
    db.all({TableName: config.notif_table}),
    db.all({TableName: config.apps_table})
  ])
  .then(([items,apps])=>{
    res.render('notifications', { admin : req.session.auth.admin ,title: 'Notifications', notifications : items, apps : apps, app : {} });
  })
  .catch(error=>{
    console.error('<get notifications> error:',error);
    res.status(400).send('error');
  })
  
});

router.get('/all', function(req, res, next) {
  db.all({TableName: config.notif_table})
  .then((items)=>{
    res.status(200).json(items);
  })
  .catch(error=>{
    console.error('<get notifications> error:',error);
    res.status(400).send('error');
  })
  
});

router.post('/',(req,res,next)=>{
  var body = req.body;

  body.id = parseInt(body.id);

  db.add({
    'TableName': config.notif_table,
    'Item': body|| {},
    'Expected': { link: { Exists: false } }        
  })
  .then(data => {
    res.send(JSON.stringify(data));
  })
  .catch(error=>{
    console.error('<Add notification> error:',error);
    res.status(400).json({message:error});
  })
  
})

router.post('/edit', (req,res) => {
  var data = req.body;

  db.find({TableName : config.notif_table,Value: parseInt(data.id), Key:'id'})
  .then((notif) => {
    var up_data = {};

    if(!notif || (notif && notif.length == 0) )
      throw new Error('Role not found');
    
    up_data.id = parseInt(data.id);
    up_data.name = data.name;
    up_data.link = data.link;

    return db.update({TableName : config.notif_table, Key : {id : up_data.id} },up_data);
  })
  .then((resp)=>{
    console.log('resp:',resp)
    res.status(200).json(resp);
  })
  .catch(error=>{
    console.log('<Edit role> error:',error);
    res.status(400).json({message : error.toString()});
  });

})

router.post('/delete',(req,res,next)=>{
  var body = req.body;
  body.id = parseInt(body.id);

  var params = {
    TableName: config.notif_table,
    Key: body
  }
  db.delete(params)
  .then(data=>{
    res.status(200).json({message:'ok'});
  })
  .catch(error=>{
    console.error('<delete notification> error:',error);
    res.status(400).send('error');
  })
  
})

function subscribeOnFeed(feed) { //feed : { name , id ,link }
  
}

module.exports = router;
