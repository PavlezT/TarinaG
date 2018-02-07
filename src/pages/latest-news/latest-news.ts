import { Component, Inject } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-latest-news',
  templateUrl: 'latest-news.html',
})
export class LatestNewsPage {

  news: Array<{ date: string, icon: string, text: string }>;

  constructor(public navCtrl: NavController, @Inject(GeneralService) public service : GeneralService) {
    
  }

  ionViewDidEnter(){
    this.service.getApp
      .then(()=>{
        this.service.Sites.then((sites)=>{
          this.getNews(sites);
        })
      })
  };


  getNews(sites : Array<any> ) : Promise<any> {
    let notifications = {};
    this.news = [];
    
    sites.map(but=>{
      if(but && but.notificationid && !notifications[but.notificationid] ){
        notifications[but.notificationid] = but.logourl;
      }
    });

    let url = `_api/Notifications`;
    return this.service.get(url)
      .then( res => {
        res.json().map(notif => {
          if( notifications[notif.id.toString()] && notif.date ){
            notif.date = notif.date ? (new Date(notif.date)).toLocaleString() : '';
            notif.logourl = this.service.serverAPIUrl+notifications[notif.id.toString()] || '/assets/imgs/logo.gif' ;
            notif.content = notif.content.replace(/<a/g,'<p').replace(/<\/a/g,'</p');
            this.news.push(notif);
          }
        });

      });
  }

  openNews(n) {
    console.log('clicked: ' + n.text);
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

}