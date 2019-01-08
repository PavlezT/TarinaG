var express = require('express');
var router = express.Router();
var db = require('../db');

var config = {
  notif_table : 'Golf_Notifications'
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  db.all({TableName: config.notif_table})
  .then((items)=>{
    res.render('links', {admin : req.session.auth.admin , title: 'Links', notifications : items  });
  })
  .catch(error=>{
    console.error('<get notifications> error:',error);
    res.status(400).json({message : error});
  })

});

router.post('/',(req,res,next)=>{

  db.add({
    'TableName': config.message_table,
    'Item': req.body || []
  })
  .then(data => {
    res.send(JSON.stringify(req.body));
  })
  .catch(error=>{
    console.error('<Add notification> error:',error);
    res.status(400).json({message : error});
  })

})

module.exports = router;
