var express = require('express');
var router = express.Router();
var db = require('../db');
var request = require('request-promise');

var config = {
  roles_table : 'Golf_Roles',
  apps_table : 'Golf_Apps'
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  var admin = req.session.auth.admin;

  var params = {
    AttributesToGet : [
      'id',
      'roleid',
      'app_name',
      'name'
     ],
     Select: "SPECIFIC_ATTRIBUTES",
     TableName: config.apps_table,
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

      let promiseArr = [];

      apps.map(app=>{
        promiseArr.push(getInfo(app.app_name));//'com.google.android.apps.plus'));//app.app_name
      })

      return Promise.all([Promise.resolve(apps),Promise.resolve(roles),Promise.all(promiseArr)]);
    })
    .then(([apps,roles,analytics])=>{
      res.render('analytics', { admin : admin ,title: admin ? 'Analytics' : (apps && apps[0] && apps[0].name ? apps[0].name + ' Analytics' : '0 apps' ), apps : apps ,roles : roles, analytics : analytics});
    })
    .catch(error=>{
      res.render('error',{message : 'Error while getting apps', error : {stack : error, status : '500'}});
    })
});

function getInfo(app_id){
  let key = '512c27bfc0786481626608e72079d9b611c77465';
  var start_date = (new Date(Date.now())); //2016-05-24
  var end_date = start_date.getFullYear() + '-' + ( (start_date.getUTCMonth()+1) < 10 ? '0'+(start_date.getUTCMonth()+1) :(start_date.getUTCMonth()+1)) + '-' + (start_date.getDate() < 10 ? '0'+start_date.getDate() : start_date.getDate() );
  start_date = start_date.getFullYear() + '-' + ( (start_date.getUTCMonth()+1) < 10 ? '0'+(start_date.getUTCMonth()+1) :(start_date.getUTCMonth()+1)) + '-01';

  let urlReviewsAndroid = `https://data.42matters.com/api/v2.0/android/apps/reviews.json?p=${app_id}&access_token=${key}&start_date=${start_date}&end_date=${end_date}`;
  let urlDownloadsAndroid = `https://data.42matters.com/api/v2.0/android/apps/lookup.json?p=${app_id}&access_token=${key}&include_unpublished=true`;
  // let urlReviewsIOS = `https://data.42matters.com/api/v2.0/ios/apps/reviews.json?id=${app_id}&access_token=${key}&start_date=${start_date}`;
  // let urlDownloadsIOS = `https://data.42matters.com/api/v2.0/ios/apps/lookup.json?id=${app_id}&access_token=${key}&include_unpublished=true`;

  return Promise.all([
    request({method: 'GET',uri: urlReviewsAndroid}).catch(error=>{return `{"total_reviews" : "error getting data", "number_reviews" : "error getting data"}`}),
    request({method: 'GET',uri: urlDownloadsAndroid}),
    // request({method: 'GET',uri: urlReviewsIOS}),
    // request({method: 'GET',uri: urlDownloadsIOS})
  ])
    .then(([reviewsAnd,downloadsAnd]) => {
      try{
        downloadsAnd = JSON.parse(downloadsAnd);
        reviewsAnd = JSON.parse(reviewsAnd);
      }catch(e){
        reviewsAnd = {total_reviews : 'error parse',number_reviews : 'error parse'};
        downloadsAnd = {downloads : 'error'};
      }
      return {
        android : {
           downloads : downloadsAnd.downloads,
           total_reviews : reviewsAnd.total_reviews,
           number_reviews : reviewsAnd.number_reviews
          }
        };
    })
    .catch((err) => {
      console.error('<Get analytics> error: ',err.message);
      return {error : err.message};
    });
}

module.exports = router;
