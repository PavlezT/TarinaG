var express = require('express');
var router = express.Router();
var db = require('../db');
const multer = require('multer');
var fs = require('fs');

var config = {
  roles_table : 'Golf_Roles',
  apps_table : 'Golf_Apps',
  buttons_table : 'Golf_App_Buttons',
  notifications_table : 'Golf_Notifications',
  images_table : 'Golf_Images',
  tabs_table : 'Golf_Partners_Tabs',
  icons_table : 'Golf_Partners_Icons',
  contacts_table : 'Golf_Contacts',
  splash_table : 'Golf_SplashScreens',
  about_table : 'Golf_AboutInfo',
  public_folder : 'public'
}
var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, config.public_folder+"/images/apps/");
  },
  filename: function (req, file, callback) {
      callback(null, Date.now() + "_" + file.originalname);
  }
});
const upload = multer({
  storage : Storage,
  limits: {fileSize: 10000000, files: 1},
  fileFilter:  (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|ico|png|gif)$/)) {

          return callback(new Error('Only Images are allowed (png,jpg,jpeg)!'), false)
      }

      callback(null, true);
  }
}).single('image');

/* GET home page of app. */
router.get('/', function(req, res, next) {

  var params = {
    AttributesToGet : [
      'id',
      'roleid',
      'app_name',
      'name',
      'teetimes_href',
      'latitude',
      'longitude',
      'weather_apikey'
     ],
     Select: "SPECIFIC_ATTRIBUTES",
     TableName: config.apps_table,
  }

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
    .then(([apps,roles])=>{

      apps.filter(app => {
        roles.map(role => {
          if(role.id == app.roleid){
            app.role = role.name;
          }
        })
      });

      res.render('apps', { admin : req.session.auth.admin ,title: 'Apps', apps : apps ,roles : roles});
    })
    .catch(error=>{
      res.render('error',{message : 'Error while getting apps', error : {stack : error, status : '500'}});
    })
});

router.post('/create',(req,res,next)=>{
  var data = req.body;
  data.id = (Date.now());
  
  db.add({
    'TableName': config.apps_table,
    'Item': data || {}     
  })
  .then(resp => {
    res.status(200).json({url : `/appview/${data.id['N']}`})
  })
  .catch(error=>{
    console.error('<Add app> error:',error);
    res.status(400).json({message : error });
  })

});

router.post('/edit',(req,res,next)=>{
  var data = req.body;

  db.find({TableName : config.apps_table,Value: parseInt(data.id), Key:'id'})
  .then((app) => {
    var up_data = {};

    if(!app || (app && app.length == 0) )
      throw new Error('App not found');
    
    Object.keys(data).map(key=>{
      up_data[key] = data[key];
    })
    up_data.id = parseInt(data.id);
    // up_data.name = data.name;
    // up_data.roleid = data.roleid;

    return db.update({TableName : config.apps_table, Key : {id : up_data.id} },up_data);
  })
  .then((resp)=>{
    res.status(200).json({url : `/appview/${data.id}`});
  })
  .catch(error=>{
    console.log('<Edit app> error:',error);
    res.status(400).json({message : error.toString()});
  });

});

router.post('/delete',(req,res,next)=>{
  var params = {
    TableName  : config.apps_table,
    Key : {}
  };

  if(req.body.id)
    params.Key.id = parseInt(req.body.id);
  else {
    return res.status(400).json({message : 'There are no provided App Id'})
  }
  
  db.delete(params)
    .then(()=>{
      res.send('ok');
    })
    .catch(error=>{
      console.log('<Delete app> error:',error);
      res.status(400).json(error);
    })
});

router.get('/appview/:appid', (req,res) => {
  var appid = req.params.appid;
  if( !(appid && appid.length > 0 && appid != 'undefined') )
    return res.render('error',{message : '1Error while getting app view:', error : {stack : 'maybe you have not provided appid', status : '500'}});

  Promise.all([
    db.find({TableName : config.apps_table,Value: parseInt(appid), Key:'id'}),
    db.all({TableName : config.notifications_table , ScanFilter : {
      app_id : {
        ComparisonOperator : 'EQ',
        AttributeValueList : [
          { S : appid }
        ]
      }
    }}),
    db.all({TableName : config.buttons_table,ScanFilter : {
      appid :{
        ComparisonOperator : 'EQ',
        AttributeValueList : [
          { S : appid }
        ]
      }
    }})
  ])
    .then(([app,notifications,buttons]) => {
      buttons = buttons.map( button => {
        button.style = "";
        button.style+=(button.text_color?'color:'+button.text_color+';' : '');
        button.style+=(button.back_color?'background-color:'+button.back_color+';' : '');
        if(button.border == 'true'){
          button.style+='border-color:'+button.border_color+';';
          button.style+='border-width:'+button.border_width+';';
          button.style+='border-radius:'+button.border_radius+';';
          button.style+='box-shadow:'+button.box_shadow+';';
        }
        return button;
      })

      buttons.sort((a, b) => {
        if(parseInt(a.order) > parseInt(b.order))
          return 1;
        return -1;
      })

      if(app && app[0])
        return res.render('appview',{ admin : req.session.auth.admin, title : "Home view of app - "+ app[0].name, app : app[0], notifications : notifications, buttons : buttons});
      throw new String('There is no such app');
    })
    .catch(error => {
      res.render('error',{message : 'Error while getting app view', error : {stack : error, status : '500'}});
    })

})

router.post('/appview/:appid', (req,res) => {
  var appid = req.params.appid;
  var data = JSON.parse(req.body.button);
  if( !(appid && appid.length > 0) )
    return res.render('error',{message : 'Error while getting app view', error : {stack : error, status : '500'}});
  
  data.appid = appid;
  data.id = Date.now();

  ((req.body.old_order && data.order.toString() != req.body.old_order.toString())? 
    db.find({TableName : config.buttons_table,Value: data.order.toString(), Key:'order'})
      .then((resp)=>{
        if(resp && resp[0]){
          resp[0].order = req.body.old_order.toString();
          db.update({TableName : config.buttons_table, Key : {id : parseInt(resp[0].id)} },resp[0]);
        }
      })
      .catch(error=>{
        console.error('<Add app button> error change order:',error);
      })
    : Promise.resolve()  )
  .then(()=>{
    return db.add({
      'TableName': config.buttons_table,
      'Item': data || {}     
    })
  })
  .then(resp => {
    res.status(200).json({url : `/appview/${data.id['N']}`})
  })
  .catch(error=>{
    console.error('<Add app button> error:',error);
    res.status(400).json({message : error });
  })
})

router.put('/appview/',(req,res) => {
  var data = req.body;

  ((data.old_order && data.order.toString() != data.old_order.toString())? 
    db.find({TableName : config.buttons_table,Value: data.order.toString(), Key:'order'})
      .then((resp)=>{
        if(resp && resp[0]){
          resp[0].order = data.old_order.toString();
          db.update({TableName : config.buttons_table, Key : {id : parseInt(resp[0].id)} },resp[0]);
        }
      })
      .catch(error=>{
        console.error('<Edit app button> error change order:',error);
      })
    : Promise.resolve()  )
  .then(()=>{
    return db.find({TableName : config.buttons_table,Value: parseInt(data.id), Key:'id'})
  })
  .then((app) => {
    var up_data = {};

    if(!app || (app && app.length == 0) )
      throw new Error('App not found');
    
    up_data = data;
    up_data.id = parseInt(data.id);
    delete up_data.old_order;

    return db.update({TableName : config.buttons_table, Key : {id : up_data.id} },up_data);
  })
  .then((resp)=>{
    res.status(200).json({url : `/appview/${data.id}`});
  })
  .catch(error=>{
    console.log('<Edit app button> error:',error);
    res.status(400).json({message : error.toString()});
  });
})

router.delete('/appview/',(req,res) => {
  var params = {
    TableName  : config.buttons_table,
    Key : {}
  };

  if(req.body.id)
    params.Key.id = parseInt(req.body.id);
  else {
    return res.status(400).json({message : 'There are no provided Button Id'})
  }
  
  db.delete(params)
    .then(()=>{
      res.send('ok');
    })
    .catch(error=>{
      console.log('<Delete app button> error:',error);
      res.status(400).json(error);
    })
})

router.post('/image',(req,res) => {
  if( !(req.query.appid && req.query.appid > 0) )
    return res.status(500).json({message : 'Do not provided application Id!'})

  upload(req,res,(err)=>{
    if(err)
      return res.status(415).json({ message: err })
    
    var image_data = {
      id : Date.now(),
      name : req.file.originalname,
      appid : req.query.appid,
      url : req.file.path.substring('public'.length,req.file.path.length)
    }
    db.add({
      'TableName': config.images_table,
      'Item': image_data
    })
    .then((data)=>{
      res.status(200).json(data);
    })
    .catch(error=>{
      console.error('<Upload Image> error:',error);
      res.status(500).json({message : error})
    })
  })
})

router.delete('/image',(req,res) => {
  var params = {
    TableName  : config.images_table,
    Key : {}
  };

  if(req.body.id)
    params.Key.id = parseInt(req.body.id);
  else {
    return res.status(400).json({message : 'There are no provided Image Id'})
  }
  
  return db.find({TableName : config.images_table,Value: parseInt(req.body.id), Key:'id'})
    .then(image => {
      if(image && image[0] && image[0].url)
        return Promise.all([
          Promise.resolve(image[0]),
          db.find({TableName : config.buttons_table,Value: image[0].url, Key:'logourl'}),
          db.find({TableName : config.icons_table,Value: image[0].url, Key:'logourl'}),
        ]);
      else
        return Promise.reject('There is no such image!');
    })
    .then(([image,button, icon])=>{
      if( (button && button[0] && button[0].id) || (icon && icon[0] && icon[0].id) )
        return Promise.reject("This image is using");
      return Promise.all([Promise.resolve(image),db.delete(params)]);
    })
    .then(([image,info])=>{
      res.send('ok');

      fs.unlink(config.public_folder + image.url, function(error) {
        if (error) {
            console.log('<Delete image> error in deleting file:',error)
        }
      });
    })
    .catch(error=>{
      console.log('<Delete app tab> error:',error);
      res.status(400).json({message: error});
    })
})

router.get('/apppartners/:appid', (req,res) => {
  var appid = req.params.appid;
  if( !(appid && appid.length > 0 && appid != 'undefined') )
    return res.render('error',{message : '1Error while getting app view:', error : {stack : 'maybe you have not provided appid', status : '500'}});

  Promise.all([
    db.find({TableName : config.apps_table,Value: parseInt(appid), Key:'id'}),
    db.all({TableName : config.icons_table,ScanFilter : {
      appid :{
        ComparisonOperator : 'EQ',
        AttributeValueList : [
          { S : appid }
        ]
      }
    }}),
    db.all({TableName : config.tabs_table,ScanFilter : {
      appid :{
        ComparisonOperator : 'EQ',
        AttributeValueList : [
          { S : appid }
        ]
      }
    }})
  ])
    .then(([app,icons,tabs]) => {
      tabs.sort((a, b) => {
        if(parseInt(a.order) > parseInt(b.order))
          return 1;
        return -1;
      })

      icons.sort((a,b)=>{
        if(parseInt(a.order) > parseInt(b.order))
          return 1;
        return -1;
      })

      if(app && app[0])
        return res.render('apppartners',{ admin : req.session.auth.admin, title : "Partners view of app - "+ app[0].name, app : app[0], icons : icons, tabs : tabs});
      throw new String('There is no such app');
    })
    .catch(error => {
      res.render('error',{message : 'Error while getting app view', error : {stack : error, status : '500'}});
    })

})

router.post('/apppartners/tab/:appid', (req,res) => {
  var appid = req.params.appid;
  var data = JSON.parse(req.body.tab);
  if( !(appid && appid.length > 0) )
    return res.render('error',{message : 'Error while getting app partners', error : {stack : error, status : '500'}});
  
  data.appid = appid;
  data.id = Date.now();

  ((req.body.old_order && data.order.toString() != req.body.old_order.toString())? 
    db.find({TableName : config.tabs_table,Value: data.order.toString(), Key:'order'})
      .then((resp)=>{
        if(resp && resp[0]){
          resp[0].order = req.body.old_order.toString();
          db.update({TableName : config.tabs_table, Key : {id : parseInt(resp[0].id)} },resp[0]);
        }
      })
      .catch(error=>{
        console.error('<Add app tab> error change order:',error);
      })
    : Promise.resolve()  )
  .then(()=>{
    return db.add({
      'TableName': config.tabs_table,
      'Item': data || {}     
    })
  })
  .then(resp => {
    res.status(200).json({url : `/apppartners/${appid}`})
  })
  .catch(error=>{
    console.error('<Add app tab> error:',error);
    res.status(400).json({message : error });
  })
})

router.put('/apppartners/tab',(req,res) => {
  var data = req.body;

  ((data.old_order && data.order.toString() != data.old_order.toString())? 
    db.find({TableName : config.tabs_table,Value: data.order.toString(), Key:'order'})
      .then((resp)=>{
        if(resp && resp[0]){
          resp[0].order = data.old_order.toString();
          db.update({TableName : config.tabs_table, Key : {id : parseInt(resp[0].id)} },resp[0]);
        }
      })
      .catch(error=>{
        console.error('<Edit app tab> error change order:',error);
      })
    : Promise.resolve()  )
  .then(()=>{
    return db.find({TableName : config.tabs_table,Value: parseInt(data.id), Key:'id'})
  })
  .then((app) => {
    var up_data = {};

    if(!app || (app && app.length == 0) )
      throw new Error('Tab not found');
    
    up_data = data;
    up_data.id = parseInt(data.id);
    delete up_data.old_order;

    return db.update({TableName : config.tabs_table, Key : {id : up_data.id} },up_data);
  })
  .then((resp)=>{
    res.status(200).json({url : `/apppartners/${data.appid}`});
  })
  .catch(error=>{
    console.log('<Edit app button> error:',error);
    res.status(400).json({message : error.toString()});
  });
})

router.delete('/apppartners/tab',(req,res) => {
  var params = {
    TableName  : config.tabs_table,
    Key : {}
  };

  if(req.body.id)
    params.Key.id = parseInt(req.body.id);
  else {
    return res.status(400).json({message : 'There are no provided Tab Id'})
  }
  
  db.find({TableName : config.icons_table,Value: params.Key.id.toString(), Key:'tabid'})
    .then(icons => {
      if(icons && icons.length > 0 )
        throw new Error('There are connected Partners to this tab');
      return db.delete(params);
    })
    .then(()=>{
      res.send('ok');
    })
    .catch(error=>{
      console.log('<Delete app tab> error:',error);
      res.status(400).json(error);
    })
})

router.post('/apppartners/icon/:appid', (req,res) => {
  var appid = req.params.appid;
  var data = JSON.parse(req.body.icon);
  if( !(appid && appid.length > 0) )
    return res.render('error',{message : 'Error while getting app partners', error : {stack : error, status : '500'}});
  
  data.appid = appid;
  data.order = data.order ? data.order : 0;
  data.id = Date.now();
  
  ((req.body.old_order && data.order.toString() != req.body.old_order.toString())? 
      db.all({TableName : config.icons_table,ScanFilter : {
        order :{
          ComparisonOperator : 'EQ',
          AttributeValueList : [
            { S : data.order.toString() }
          ]
        },
        tabid :{
          ComparisonOperator : 'EQ',
          AttributeValueList : [
            { S : data.tabid }
          ]
        }
      }})
      .then((resp)=>{
        if(resp && resp[0]){
          resp[0].order = req.body.old_order.toString();
          db.update({TableName : config.icons_table, Key : {id : parseInt(resp[0].id)} },resp[0]);
        }
      })
      .catch(error=>{
        console.error('<Create partners icon> error change order:',error);
      })
    : Promise.resolve() )
  .then(()=>{
    return db.add({
      'TableName': config.icons_table,
      'Item': data || {}     
    })
  })
  .then(resp => {
    res.status(200).json({url : `/apppartners/${appid}`})
  })
  .catch(error=>{
    console.error('<Add app icon> error:',error);
    res.status(400).json({message : error });
  })
})

router.put('/apppartners/icon',(req,res) => {
  var data = req.body;

  data.order = data.order ? data.order : 0;

  ((data.old_order && data.order.toString() != data.old_order.toString())? 
      db.all({TableName : config.icons_table,ScanFilter : {
        order :{
          ComparisonOperator : 'EQ',
          AttributeValueList : [
            { S : data.order.toString() }
          ]
        },
        tabid :{
          ComparisonOperator : 'EQ',
          AttributeValueList : [
            { S : data.tabid }
          ]
        }
      }})
      .then((resp)=>{
        if(resp && resp[0]){
          resp[0].order = data.old_order.toString();
          db.update({TableName : config.icons_table, Key : {id : parseInt(resp[0].id)} },resp[0]);
        }
      })
      .catch(error=>{
        console.error('<Edit partners icon> error change order:',error);
      })
    : Promise.resolve()  )
  .then(()=>{
    return db.find({TableName : config.icons_table,Value: parseInt(data.id), Key:'id'});
  })
  .then((app) => {
    var up_data = {};

    if(!app || (app && app.length == 0) )
      throw new Error('Icon not found');
    
    up_data = data;
    up_data.id = parseInt(data.id);
    delete up_data.old_order;

    return db.update({TableName : config.icons_table, Key : {id : up_data.id} },up_data);
  })
  .then((resp)=>{
    res.status(200).json({url : `/apppartners/${data.appid}`});
  })
  .catch(error=>{
    console.log('<Edit app button> error:',error);
    res.status(400).json({message : error.toString()});
  });
})

router.delete('/apppartners/icon',(req,res) => {
  var params = {
    TableName  : config.icons_table,
    Key : {}
  };

  if(req.body.id)
    params.Key.id = parseInt(req.body.id);
  else {
    return res.status(400).json({message : 'There are no provided Icon Id'})
  }
  
  db.delete(params)
    .then(()=>{
      res.send('ok');
    })
    .catch(error=>{
      console.log('<Delete app icon> error:',error);
      res.status(400).json(error);
    })
})

router.get('/appcontact/:appid', function(req, res, next) {
  var appid = req.params.appid;
  if( !(appid && appid.length > 0 && appid != 'undefined') )
    return res.render('error',{message : 'Error while getting app view:', error : {stack : 'maybe you have not provided appid', status : '500'}});

  db.find({TableName : config.contacts_table,Value: appid.toString(), Key:'appid'})
    .then(contact=>{
      res.render('contacts', { admin : req.session.auth.admin ,title: 'Edit Contacts', app : {id : appid}, contact : contact[0] });
    })
    .catch(error=>{
      res.render('error',{message : 'Error while getting apps', error : {stack : error, status : '500'}});
    })
});

router.post('/appcontact/:appid', (req,res) => {
  var appid = req.params.appid;
  var data = req.body;
  if( !(appid && appid.length > 0) || Object.keys(data).length == 0 )
    return res.render('error',{message : 'Error while getting app contacts', error : {stack : error, status : '500'}});
  
  data.appid = data.appid ? data.appid : appid;
  data.id = data.id ? data.id : Date.now();
  
  db.find({TableName : config.contacts_table,Value: appid.toString(), Key:'appid'})
  .then((contact)=>{
    if(contact && contact[0] && contact[0].appid)
      return db.update({TableName : config.contacts_table, Key : {id : parseInt(data.id)} },data);
    else
      return db.add({TableName: config.contacts_table, Item : data });
  })
  .then(resp => {
    res.redirect('/apps/appcontact/'+appid)
  })
  .catch(error=>{
    console.error('<Add app icon> error:',error);
    res.render('error',{message : 'Error while getting app partners', error : {stack : error, status : '400'}});
  })
})

router.get('/appabout/:appid', function(req, res, next) {
  var appid = req.params.appid;
  if( !(appid && appid.length > 0 && appid != 'undefined') )
    return res.render('error',{message : 'Error while getting app view:', error : {stack : 'maybe you have not provided appid', status : '500'}});

  db.find({TableName : config.about_table,Value: appid.toString(), Key:'appid'})
    .then(about=>{
      res.render('appabout', { admin : req.session.auth.admin ,title: 'Edit App About page', app : {id : appid}, about : about[0] });
    })
    .catch(error=>{
      res.render('error',{message : 'Error while getting app about information', error : {stack : error, status : '500'}});
    })
});

router.post('/appabout/:appid', (req,res) => {
  var appid = req.params.appid;
  var data = req.body;
  if( !(appid && appid.length > 0) || Object.keys(data).length == 0 )
    return res.render('error',{message : 'Error while getting app about information', error : {stack : error, status : '500'}});
  
  data.appid = data.appid ? data.appid : appid;
  data.id = data.id ? data.id : Date.now();
  
  db.find({TableName : config.about_table,Value: appid.toString(), Key:'appid'})
  .then((about)=>{
    if(about && about[0] && about[0].appid)
      return db.update({TableName : config.about_table, Key : {id : parseInt(data.id)} },data);
    else
      return db.add({TableName: config.about_table, Item : data });
  })
  .then(resp => {
    res.redirect('/apps/appabout/'+appid)
  })
  .catch(error=>{
    console.error('<Add app icon> error:',error);
    res.render('error',{message : 'Error while getting app partners', error : {stack : error, status : '400'}});
  })
})

router.get('/appsplash/:appid', function(req, res, next) {
  var appid = req.params.appid;
  if( !(appid && appid.length > 0 && appid != 'undefined') )
    return res.render('error',{message : 'Error while getting app SplashScreen:', error : {stack : 'maybe you have not provided appid', status : '500'}});

  db.find({TableName : config.splash_table,Value: appid.toString(), Key:'appid'})
    .then(splash=>{
      res.render('appsplash', { admin : req.session.auth.admin ,title: 'Edit SplashScreen', app : {id : appid}, splash : splash.length > 0 ? splash[0] : null });
    })
    .catch(error=>{
      res.render('error',{message : 'Error while getting apps', error : {stack : error, status : '500'}});
    })
});

router.post('/appsplash/:appid', (req,res) => {
  var appid = req.params.appid;
  var data = req.body;
  if( !(appid && appid.length > 0) || Object.keys(data).length == 0 )
    return res.render('error',{message : 'Error while getting app contacts', error : {stack : error, status : '500'}});
  
  data.appid = data.appid ? data.appid : appid;
  data.id = data.id ? data.id : Date.now();
  
  db.find({TableName : config.splash_table,Value: appid.toString(), Key:'appid'})
  .then((splash)=>{
    if(splash && splash[0] && splash[0].appid)
      return db.update({TableName : config.splash_table, Key : {id : parseInt(splash[0].id)} },data);
    else
      return db.add({TableName: config.splash_table, Item : data });
  })
  .then(resp => {
    res.redirect('/apps/appsplash/'+appid)
  })
  .catch(error=>{
    console.error('<Add app splashscreen> error:',error);
    res.render('error',{message : 'Error while updating app splashscreen', error : {stack : error, status : '400'}});
  })
})

module.exports = router;
