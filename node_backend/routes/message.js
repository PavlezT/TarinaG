var express = require('express');
var router = express.Router();
var db = require('../db');
var pushNewNotification = require('../helpers/feed').pushNewNotification;

var config = {
  message_table : 'Golf_Messages',
  apps_table : 'Golf_Apps'
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  var admin = req.session.auth.admin;

  var params = {
    AttributesToGet : [
      'id',
      'roleid',
      'name'
     ],
     Select: "SPECIFIC_ATTRIBUTES",
     TableName: config.apps_table,
  }

  var params2 = {
    AttributesToGet : [
      'id',
      'date',
      'appid',
      'shadule',
      'userid',
      'text',
      'sended'
     ],
     Select: "SPECIFIC_ATTRIBUTES",
     ScanFilter : {
      schadule : {
        ComparisonOperator : 'EQ',
        AttributeValueList : [
          { S : 'true' }
        ]
      },
      sended : {
        ComparisonOperator : 'EQ',
        AttributeValueList : [
          { S : 'false' }
        ] 
      }
     },
     TableName: config.message_table,
  }

  if(!admin){
    params.ScanFilter = {
      roleid :{
        ComparisonOperator : 'EQ',
        AttributeValueList : [
          { S : req.session.auth.roleid }
        ]
      }
    }
  
    params2.ScanFilter.userid  = {
      ComparisonOperator : 'EQ',
      AttributeValueList : [
        { S : req.session.auth.userid }
      ]
    }
    // params2.ScanFilter.appid = {
    //   ComparisonOperator : 'EQ',
    //   AttributeValueList : [
    //     { S : req.session.auth.roleid }
    //   ]
    // }
  }

  Promise.all([db.all(params), db.all(params2)])
    .then(([apps, messages]) => {
      try{
        messages = messages.filter(message=>{
          if(admin != true){
            if(parseInt(message.appid) != parseInt(apps[0].id)){
              return null;
            } else {
              message.appname = apps[0].name;
              return message;
            }
          } else {
            apps.map(app=>{
              if(parseInt(app.id) == parseInt(message.appid) ){
                message.appname = app.name;
              }
            })
            return message;
          }
        })
      }catch(e){
        console.error('<Messages getting> js error:',e);
        messages = [];
      }
      
      res.render('message', { admin : admin ,title: 'Direct Messages', apps : apps , messages : messages});
    })
    .catch(error=>{
      res.render('error',{message : 'Error while getting messages', error : {stack : error, status : '500'}});
    })
  
});

router.post('/add',(req,res,next)=>{
  var body = req.body;
  
  if(body && body.id && body.appid){
    body.userid = req.session.auth.userid;
    body.id = parseInt(body.id);
  } else 
    return res.status(400).json({message : 'Bad object. Not all needed properties present' });
  
  const appid = body.appid;

  if(body.schadule.toString() == 'false'){
    pushNewNotification({
      id:'DirectMessages'+ body.appid,
      name : 'New Message'
    },{
      content : body.text || ''
    })
  }

  db.add({
    'TableName': config.message_table,
    'Item': body || {}
  })
  .then(data => {
    res.status(200).json(data);

    checkOldMessages(appid);
  })
  .catch(error=>{
    console.error('<Add notification> error:',error);
    res.status(400).json({message : error});
  })

  //return db.delete({TableName: config.messages_talbe, Key : { id : parseInt(message.id) }} );
  // if added new message -> delete old -> check all messages -> find oldest (date > 14 days) -> delete them

})

router.post('/edit', (req,res) => {
  var data = req.body;

  db.find({TableName : config.message_table,Value: parseInt(data.id), Key:'id'})
    .then((message) => {
      var up_data = {};

      if(!message || (message && message.length == 0) )
        throw new Error('Message not found');
      
      up_data.id = parseInt(data.id);
      up_data.text = data.text;
      // up_data.date = data.date;

      return db.update({TableName : config.message_table, Key : {id : up_data.id } },up_data);
    })
    .then(resp => {
      res.status(200).json(resp);
    })
    .catch(error => {
      res.status(400).json({message : error});
    })
})

router.post('/delete',(req,res,next)=>{
  var body = req.body;
  body.id = parseInt(body.id);

  var params = {
    TableName: config.message_table,
    Key: body
  }

  db.delete(params)
    .then(data=>{
      res.status(200).json({message:'ok'});
    })
    .catch(error=>{
      console.error('<Delete message> error:',error);
      res.status(400).json({message : error});
    })
  
})

function checkOldMessages(appid){
  var params2 = {
    AttributesToGet : [
      'id',
      'date',
      'appid',
      'shadule',
      'text',
      'sended'
     ],
     Select: "SPECIFIC_ATTRIBUTES",
     ScanFilter : {
      sended : {
        ComparisonOperator : 'EQ',
        AttributeValueList : [
          { S : 'true' }
        ] 
      },
      appid : {
        ComparisonOperator : 'EQ',
        AttributeValueList : [
          { S : appid.toString() }
        ]
      }
     },
     TableName: config.message_table,
  }

  db.all(params2)
    .then(messages =>{
      var messages_to_delete = [];
      var checkDate = (new Date(0));
      checkDate.setDate(14); //2 weeks;

      messages.map(message=>{
        message.date = new Date(message.date);

        if(message.date < (new Date( (new Date(Date.now())).getTime() - checkDate.getTime()) ) ){
          messages_to_delete.push(message);
        }
      });

      return messages_to_delete;
    })
    .then(messages => {
      messages.map(message => {
        db.delete({TableName : config.message_table, Key : {id : parseInt(message.id)}});
      })
    })
    .catch(error => {
      console.log('<Check old messages> error in appid "'+appid+'": ',error);
    })
}

module.exports = router;
