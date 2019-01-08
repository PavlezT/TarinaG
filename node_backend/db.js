var AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.REGION || 'eu-west-2',
    accessKeyId: "AKIAIP5XJWL3KMJEC2IQ",
    secretAccessKey: "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",
});
//endpoint: "arn:aws:dynamodb:eu-west-2:572963125684:table/Golf_Notifications"

// AWS.config.region = process.env.REGION

var dynamodb = new AWS.DynamoDB();

exports.getDB = () =>{
    return dynamodb;
}

exports.add = (params) => {
    return new Promise((resolve,reject)=>{
        var item = params.Item;
        Object.keys(item).map(key=>{
            const temp = item[key];
            item[key] = {};
            item[key][(typeof temp).toUpperCase().substring(0,1)] = temp.toString();
        })
        params.Item = item;
        dynamodb.putItem(params,(err,data)=>{
            if(err)
                return reject(err);
            return resolve(data);
        })
    })
}

exports.delete = (params) =>{
    var key = params.Key;
    Object.keys(key).map(item=>{
        const temp = key[item];
        key[item] = {};
        key[item][(typeof temp).toUpperCase().substring(0,1)] = temp.toString();
    });
    params.Key = key;
    return new Promise((resolve,reject)=>{
        dynamodb.deleteItem(params,(err,data)=>{
            if(err)
                return reject(err);
            return resolve(data);
        })
    })
}

exports.update = (params,new_item) =>{
    var key = params.Key;

    Object.keys(key).map(item=>{
        const temp = key[item];
        key[item] = {};
        key[item][(typeof temp).toUpperCase().substring(0,1)] = temp.toString();
    });

    params.Key = key;
    params.ExpressionAttributeValues = {};
    params.ExpressionAttributeNames = {};
    params.UpdateExpression = "SET ";

    if(new_item.id)
        delete new_item.id;

    Object.keys(new_item).map( (ikey,i, mass) =>{
        params.UpdateExpression+= `#${ikey} = :${ikey}`;
        if(i != mass.length-1)
            params.UpdateExpression+= ', ';
        params.ExpressionAttributeNames[`#${ikey}`] = ikey;
        params.ExpressionAttributeValues[`:${ikey}`] = {};
        params.ExpressionAttributeValues[`:${ikey}`][(typeof new_item[ikey]).toUpperCase().substring(0,1)] = new_item[ikey].toString();
    });

    return new Promise((resolve,reject) => {
        dynamodb.updateItem(params, (err,data) => {
            if(err)
                return reject(err);
            return resolve(data);
        })
    })
}

exports.all = (params) => {
    return new Promise((resolve,reject)=>{
        dynamodb.scan(params,(err,data)=>{
            if(err)
                return reject(err);
            resolve(data.Items.map(item => {
                Object.keys(item).map(key=>{
                    item[key] = item[key][Object.keys(item[key])[0]];
                })
                return item;
            }))
        })
    })
}

exports.find = (data) => {
    var params = {
        TableName : data.TableName,
        ExpressionAttributeValues :  {
            ":a": {
            //   S: data.Value
             }
           },
        ExpressionAttributeNames : {},
        FilterExpression : `#${data.Key}  = :a`
    };
    params.ExpressionAttributeNames[`#${data.Key}`] = data.Key;
    params.ExpressionAttributeValues[":a"][(typeof data.Value).toUpperCase().substring(0,1)] = data.Value.toString();

    return new Promise((resolve,reject)=>{
        dynamodb.scan(params,(err,data)=>{
            if(err)
                return reject(err);
            resolve(data.Items.map(item => {
                Object.keys(item).map(key=>{
                    item[key] = item[key][Object.keys(item[key])[0]];
                })
                return item;
            }))
        })
    })
}

/* Working only with primary key like ID */ //stupid shit
exports.getItem = (params) =>{
    var key = params.Key;
    Object.keys(key).map(item=>{
        const temp = key[item];
        key[item] = {};
        key[item][(typeof temp).toUpperCase().substring(0,1)] = temp;
    });
    params.Key = key;
    return new Promise((resolve, reject) =>{
        dynamodb.getItem(params,(err,data)=>{
            if(err)
                return reject(err);
            resolve(data);
        })
    })
}