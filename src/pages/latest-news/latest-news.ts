import { Component, Inject } from '@angular/core';
import { NavController } from 'ionic-angular';
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
  private iab: InAppBrowser,public loadingCtrl: LoadingController) {
    
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

        this.news.sort((a,b)=>{
          console.log('a.date:',(new Date(a.date)))
          console.log('b.date:',(new Date(b.date)));
          console.log("compare:",(new Date(a.date)).getTime() < (new Date(b.date)).getTime())
          if( (new Date(a.date)) < (new Date(b.date)) )
            return 1;
          console.log('not 1;')
          if( (new Date(a.date)) > (new Date(b.date)))
            return -1;
          console.log('not -1;')
          return 0;
        })

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