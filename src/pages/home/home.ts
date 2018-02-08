import { Component, Inject } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { LoadingController, Loading } from 'ionic-angular';

import { SubmenuPage } from '../submenu/submenu';
import { SettingsPage } from '../settings/settings';
import { GeneralService } from '../../utils/service';
import { Toast } from '../../utils/toast';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  services: Array<{ name: string, icon: string, notificationid: string, component: any, newNews : boolean }>;
  loader : Loading;

  constructor(public navCtrl: NavController, @Inject(GeneralService) public service : GeneralService,
              private iab: InAppBrowser,public loadingCtrl: LoadingController, @Inject(Toast) public toast : Toast
            ) {
    this.services = null;
    
  }

  openService(s) {
    if (s.component) {
      this.navCtrl.push(s.component, {
        pageName: s.name
      });
    } else {
      const browser = this.iab.create(s.link,'_blank',{
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
          this.toast.showToast('Error occur while loading page.');
          this.loader.dismiss();
        })
      }catch(e){
        console.log('Run in browser');
        this.loader.dismiss();
      }
    }
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

  ionViewDidEnter(){
    this.service.getApp
      .then(()=>{
        return this.service.Sites;
      })
      .then(sites => {
        this.services = sites;
        return this.getNews(sites);
      })
      .then((newNews)=>{
        //window.localStorage.clear();/// delete 
        newNews.map(news => {
          let oldnews = window.localStorage.getItem(news.id);
          if( !oldnews || (oldnews && (new Date(oldnews)) < news.date ) ){
            window.localStorage.setItem(news.id,news.date.toJSON());
            this.addNotification(news.id.toString());
          }
        })
        
      })
  }

  private addNotification(newsid : string) : void {
    this.services.filter((but,index) => {
      if(but.notificationid == newsid)
        this.services[index].newNews = true;
    })
  }

  getNews(sites : Array<any> ) : Promise<any> {
    let notifications = {};
    let news = [];
    
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
            notif.date = notif.date ? (new Date(notif.date)) : new Date();
            news.push(notif);
          }
        })
      })
      .then(()=>{
        return news;
      })
      .catch(error=>{
        return [];
      });
  }

  public showLoader() : Promise<any> {
    this.loader = this.loadingCtrl.create({
      content: '',
    });

    return this.loader.present();
  }

}
