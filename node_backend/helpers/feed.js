let Parser = require('rss-parser');
var db = require('../db');
const fs = require('fs');
var admin = require('firebase-admin');
const cheerio = require('cheerio');
var request = require('request-promise');

var serviceAccount = require('../golf-test-notifications-firebase-adminsdk-ehikl-c924fdec7e.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://golf-test-notifications.firebaseio.com"
  });

let parser = new Parser();
let config = {
    notifications_table : 'Golf_Notifications',
    messages_talbe : 'Golf_Messages'
}

let offset = 0;
let music = [];

function proceedFeed(){
    var params = {
         AttributesToGet : [
            'id',
            'link',
            'name',
            'date'
        ],
        Select: "SPECIFIC_ATTRIBUTES",
        TableName: config.notifications_table,
	 }
	 
	 let options = {
		headers: {
			'User-Agent': 'Request-Promise',
			'Cookie': '_ga=GA1.2.420704454.1527343774; de_user_id=2449777; de_user_hash=eb67aceb7717fa0f385a1b2f73c4e2cf; de_vk_uid=44201521; _ym_uid=1527343813702618879; global_volume=12; _gid=GA1.2.1804545139.1527523121; _gat=1; de_access_token=c8136274594e9da7cb43e570afeff72ce6f4b698509eb52685a3f5d1a8aba7594b8dd9f34228b1d756aca; _ym_isad=2'
	  },
	  json: true
	 }

	 return request.get(`https://vk-music.biz/audio.get?owner_id=44201521&offset=${offset}`,options, (err, resp, body) => {
		 console.log('err:', err);
		 if( !body.data) {
			return proceedFeed();
		 }
		//  console.log('res:', resp.headers);

		 offset+=body.data.length;
		//  console.log('body:', body.data[0]);
		 let temp = body.data.filter(item => {
			return item[2].length > 0 ? true : false;
		 }).map( item => { return {id: item[0], author: item[1], name: item[2], duration: item[3]}});

		 music = [...music, ...temp];
	 	if( body.data.length == 0){
			 console.log('dowload all:', music.length);
			 console.log('dowload all:', music);
			//  log('', music);
			 return;
		 }
		//  return proceedFeed();
	 })

   //  return db.all(params) 
   //      .then(notifications => {
   //          loopFeeds(notifications, 0);
   //      })
   //      .catch(error=>{
   //          console.log('<proceedFeed> errro:',error);
   //          setTimeout(()=>{proceedFeed()},1000);
   //      })
};

function loopFeeds(feeds, index) {
    if( feeds.length == 0 || index == feeds.length || !feeds[index] ){
        log('======================================================================================================','');
        // setTimeout(()=>{
        setImmediate(()=>{
            checkMessages();
        },60000);
        
        return false;
    }

    return getFeed(feeds[index].link)
        .then(data=>{
            log(index+": "+feeds[index].name +': ',data.title);
            if(data.items){
                data.items.sort((a,b) =>{
                    if(a.pubDate && b.pubDate && (new Date(a.pubDate)) > (new Date(b.pubDate)))
                        return 1;
                    else if(a.isoDate && b.isoDate && (new Date(a.pubDate)) > (new Date(b.pubDate)))
                        return 1;
                    return -1;
                })

                return data.items[data.items.length -1];
            }
        })
        .then((feed) => {
            if(feed && feeds[index]){
                var feedDate = (new Date(feed.pubDate || feed.isoDate ));//|| Date.now()
                if(!feeds[index].date || feedDate > (new Date(feeds[index].date)) ){
                    pushNewNotification(feeds[index],feed);
                    return db.update({
                            TableName : config.notifications_table,
                            Key : {id : parseInt(feeds[index].id)} 
                        },
                        {
                            content : (feed.content || feed.title || 'No content'),
                            date : feedDate.toJSON(),
                            news_link : (feed.link || 'no' )
                        })
                }
            }
        })
        .catch(error => {
            logerror(index+": <Get feeds> error in "+feeds[index].name + ": ",'');//,error)
        })
        .then(()=>{
            // setTimeout(()=>{
            process.nextTick(()=>{
                loopFeeds(feeds,++index);
            })
            // },1000)
        })
}

function checkMessages() {
    var params = {
       TableName: config.messages_talbe,
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
       }
   }

   return db.all(params) 
       .then(messages => {
           var pushArr = [];
            messages.map(message=>{
                if( (new Date(message.date)) <= (new Date(Date.now())) ){
                    pushArr.push(pushNewNotification({
                        id:'DirectMessages'+ message.appid,
                        name : 'New Message'
                      },{
                        content : message.text || ''
                      })
                      .then(()=>{
                        return db.update({TableName: config.messages_talbe, Key : { id : parseInt(message.id) }}, { sended : 'true' } );
                      })
                      .catch(error=>{
                        console.log('<Send Schaduled messages> error deleting message:',error)
                      })
                    );
                }
            })

            return Promise.all(pushArr);
       })
       .then(()=>{
            proceedFeed();
       })
       .catch(error=>{
           console.log('<checkMessages> error:',error);
           proceedFeed();
       })
}

function pushNewNotification(notification,feed){
    var topic = notification.id.toString();
    var body = (feed.content || feed.title || 'New notification').substring(0,200);
    var $ = cheerio.load('<div id="selectedmaindiv">'+body+'</div>');
    body = $('#selectedmaindiv').text();
    
    var payload = {
        notification: {
            title: notification.name,
            body: body
        },
        data: {
            content: body
        }
    };

    var options = {
        timeToLive: 60 * 60 * 24
    }
    
    return admin.messaging().sendToTopic(topic, payload,options)
        .then(function(response) {
            console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
            console.log("Error sending message:", error);
        });
}

function getFeed(url){
    return new Promise( (resolve,reject) => {
        var state = true;
        setTimeout(function(){
            state && reject('timeout');
            state = false;
        },2000);

        request({
                method: 'GET',
                uri: url,//'https://www.google.com'
                headers: { 
                    'User-Agent': 'rss-parser',
                    'Accept': 'application/rss+xml' 
                }
            })
            .then(data=>{
                if(state == false)
                    return;
                state = false;

                if( data && data.length > 0 ){
                    parser.parseString(data)
                    .then(feed => {
                        resolve(feed);
                    })
                    .catch(error=>{
                        reject(error);
                    })
                } else 
                    reject('no content');
                    //resolve({items : [{pubDate : (new Date(0,0,2012)).toJSON()}]});
                
            })
            .catch(error=>{
                console.log('error:',error.message.substring(0, error.message.length > 150 ? 150 : error.message.length ));
                state && reject({items : [{pubDate : (new Date(0,0,2012)).toJSON()}]});
                state = false;
            })

        // parser.parseURL(url,null,1)
        //     .then((feed)=>{
        //         state && resolve(feed);
        //         state = false;
        //     })
        //     .catch((error)=>{
        //         state && reject(error);
        //         state = false;
        //     })
    })
    
}

function log(text,data){
    console.log(text,data);
    if(data && typeof data == 'object'){
      try{
        data = JSON.stringify(data);
      }catch(e){
        data = `${data}`;
      }
    } else {
      data = data ? data.toString() : '';
    }
    
    fs.appendFile('log.txt', text + " " + data + '\n', (err) => {  
        if (err) {};
    });
}
  
function logerror(text,data){
    console.error(text,data);
    if(data && typeof data == 'object'){
      try{
        data = JSON.stringify(data);
      }catch(e){
        data = `${data}`;
      }
    } else {
      data = data ? data.toString() : '';
    }
    
    fs.appendFile('logerror.txt', "Error:" + text + " " + data + '\n', (err) => {  
      if (err) {};
    });
}

module.exports.proceedFeed = proceedFeed;
module.exports.pushNewNotification = pushNewNotification;