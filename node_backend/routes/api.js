var express = require('express');
var router = express.Router();
var db = require('../db');

var config = {
  message_table : 'Golf_Messages',
  apps_table : 'Golf_Apps'
}

var Keys = {
    hash : true,
    password : true
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    db.getDB().listTables({}, function(err, data) {
        if (err) 
            res.status(400).json({error: err});
        else {
            for(var i =0; i < data.TableNames.length; i++){
                data.TableNames[i] = data.TableNames[i].substring('Golf_'.length,data.TableNames[i].length);
            }
            res.status(200).json(data.TableNames);
        }
      });
    
});

router.get('/:table',(req,res,next)=> {
    var params = {
        TableName: 'Golf_'+req.params.table
    }
    
    if(req.query.filter){
        var filter = JSON.parse(req.query.filter);
        params.ScanFilter = {};
        Object.keys(filter).map(key => {
            params.ScanFilter[key] = {
                ComparisonOperator : 'EQ',
                AttributeValueList : [
                  { S : filter[key].toString() }
                ]
            }
        })
    }

    if(req.params.table.length == 0)
        return res.status(400).json({message: 'Invalid parametr: table'})

    db.all(params)
        .then(info=>{
            for(var i = 0; i < info.length; i++){
                Object.keys(info[i]).map( key => {
                    if(Keys[key]){
                        delete info[i][key];
                    }
                })
            }
            
            if(req.query.expand){
                let promiseArr = [];
                
                info.map(info_item => {
                    JSON.parse(req.query.expand).map(expand=>{
                        promiseArr.push(db.find({Key : expand.key,Value : (expand.key == 'id'? parseInt(info_item[expand.field]) : info_item[expand.field]),TableName: 'Golf_'+expand.table}));
                    })
                });
                
                return Promise.all(promiseArr)
                    .then(promiseRes => {
                        return info.filter( (info_item,info_index) => {
                            JSON.parse(req.query.expand).map( (expand, expand_index)=>{
                                info_item[expand.table] = promiseRes[info_index + expand_index] && promiseRes[info_index + expand_index][0]? promiseRes[info_index + expand_index][0] : {};
                            });
                            return info_item;
                        })
                    })
            }
            return Promise.resolve(info);
            
        })
        .then((info)=>{
            res.status(200).json(info);
        })
        .catch(error => {
            res.status(400).json(error);
        })
})

router.get('/:table/:field/:value', (req,res) => {
    var params = {
        Key : req.params.field,
        Value : req.params.value,
        TableName: 'Golf_'+req.params.table
    }

    if( !params.Key || params.Key.length == 0 || !params.Value || params.Value.length == 0 || !params.TableName || params.TableName.length == 0 )
        return res.status(400).json({message : 'Invalid params'});

    params.Key = params.Key.toString().toLowerCase();

    if(params.Key == 'id')
        params.Value = parseInt(params.Value);

    db.find(params)
        .then(info=>{
            if(info && info.length > 0){
                info.map(item => {
                    Object.keys(item).map( key => {
                        if(Keys[key]){
                            delete item[key];
                        }
                    })
                    return item;
                })

                res.status(200).json(info);
            } else {
                res.status(203).json([]);
            }
        })
        .catch(error => {
            res.status(400).json(error);
        })
})

module.exports = router;