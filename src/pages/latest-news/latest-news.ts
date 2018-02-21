import { Component, Inject } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { LoadingController, Loading } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { SettingsPage } from '../settings/settings';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-latest-news',
  templateUrl: 'latest-news.html',
})
export class LatestNewsPage {

  news: Array<{ date : Date, view_date: string, logourl: string, content: string }>;
  loader : Loading;

  constructor(public navCtrl: NavController, @Inject(GeneralService) public service : GeneralService,
  private iab: InAppBrowser,public loadingCtrl: LoadingController,public events: Events) {
    this.events.subscribe('news:check',()=>{
      this.loadView();
    });
  }

  ionViewDidEnter(){
    this.loadView();
  };

  public loadView() : Promise<any> {
    return this.service.getApp
      .then(()=>{
        this.service.Sites.then((sites)=>{
          this.getNews(sites);
        })
      })
  }

  public getNews(sites : Array<any> ) : Promise<any> {
    let notifications = {};
    this.news = [];
    
    sites.map(but=>{
      if(but && but.notificationid && !notifications[but.notificationid] ){
        notifications[but.notificationid] = but.logourl;
      }
    });

    let url = `_api/Notifications`;
    let url2 = `_api/Messages?filter={"sended": "true"}`;
    return Promise.all([this.service.get(url), this.service.get(url2)])
      .then( ([res,res2]) => {
        res.json().map(notif => {
          if( notifications[notif.id.toString()] && notif.date ){
            notif.view_date = notif.date ? (new Date(notif.date)).toLocaleString() : '';
            notif.logourl = this.service.serverAPIUrl+notifications[notif.id.toString()] || 'assets/imgs/dmlogo.png' ;
            notif.content = notif.content.replace(/<a/g,'<p').replace(/<\/a/g,'</p');
            this.news.push(notif);
          }
        });

        res2.json().map(message => {
          this.news.push({
            view_date : (new Date(message.date)).toLocaleString(),
            logourl : 'assets/imgs/dmlogo.png',
            content : message.text,
            date : message.date
          })
        })
      
        for(var i = 0; i < this.news.length ; i++){
          for(var j = i; j < this.news.length; j++){
            var time1 = (new Date(this.news[i].date));
            var time2 = (new Date(this.news[j].date));
            
            if(time1.getFullYear() == time2.getFullYear() && time1.getMonth() == time2.getMonth() && time1.getDay() == time2.getDay()){
              if( (time1.getHours() < time2.getHours()) || (time1.getHours() == time2.getHours() && time1.getMinutes() < time2.getMinutes()) ){
                var temp = this.news[i];
                this.news[i] = this.news[j];
                this.news[j] = temp;
              }
            } else if(time1 < time2 ){
              var temp = this.news[j];
              this.news[j] = this.news[i];
              this.news[i] = temp;
            }
          }
        }

        console.log('news:',window['news_b'] = this.news)
      })
      .catch(error=>{
        this.news=[];
      })
  }

  openNews(n) {
    if( !n.news_link )
      return;
    
    const browser = this.iab.create(n.news_link,'_blank',{
      location : 'no',
      zoom : 'no',
      hidden : 'yes'
    });
     
    this.showLoader();
    try{
      browser.on('loadstop').subscribe((type)=>{
        browser.show();
        this.loader.dismiss();
      })

      browser.on('loaderror').subscribe((type) => {
        this.loader.dismiss();
      })
    }catch(e){
      console.log('Run in browser');
      this.loader.dismiss();
    }
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

  public showLoader() : Promise<any> {
    this.loader = this.loadingCtrl.create({
      content: '',
    });

    return this.loader.present();
  }

}