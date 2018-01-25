import { Component, Inject } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { LoadingController, Loading } from 'ionic-angular';

import { SubmenuPage } from '../submenu/submenu';
import { SettingsPage } from '../settings/settings';
import { GeneralService } from '../../utils/service';
import { Toast } from '../../utils/toast';
import * as consts from '../../utils/consts';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  services: Array<{ name: string, icon: string, notification: boolean, component: any }>;
  loader : Loading;

  constructor(public navCtrl: NavController, @Inject(GeneralService) public service : GeneralService,
              private iab: InAppBrowser,public loadingCtrl: LoadingController, @Inject(Toast) public toast : Toast) {
    this.services = null;
    
  }

  // setServices() {
  //   this.services = null;// [
  //     // { back_color : 'red', border : 'true', border_color : 'red', border_width : '10px',
  //     // logourl : 'https://', notificationid : '123123', order : '1' , text : 'asd', text_color : 'red' }
  //     // { name: 'Website', icon: 'wwwlogo', notification: true, component: null },
  //     // { name: 'Facebook', icon: 'fblogo', notification: false, component: null },
  //     // { name: 'Instagram', icon: 'instalogo', notification: true, component: null },
  //     // { name: 'Twitter', icon: 'twitterlogo', notification: true, component: null },
  //     // { name: 'YouTube', icon: 'youtubelogo', notification: false, component: null },
  //     // { name: 'NexGolf', icon: 'nglogo', notification: true, component: SubmenuPage },
  //     // { name: 'Addional Services', icon: 'aslogo', notification: false, component: SubmenuPage }
  //   //]
  // }

  openService(s) {
    if (s.component) {
      this.navCtrl.push(s.component, {
        pageName: s.name
      });
    } else {
      const browser = this.iab.create(s.link,'_blank',{
        location : 'no',
        zoom : 'no'
      });
      browser.hide();
      this.showLoader();
      try{
        browser.on('loadstop').subscribe((type)=>{
          browser.show();
          this.loader.dismissAll();
        })

        browser.on('loaderror').subscribe((type) => {
          this.toast.showToast('Error occur while loading page.');
          this.loader.dismissAll();
        })
      }catch(e){
        console.log('Run in browser');
        this.loader.dismissAll();
      }
    }
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

  ionViewDidEnter(){
    this.getSites();
  }

  public showLoader() : Promise<any> {
    this.loader = this.loadingCtrl.create({
      content: 'Wait',
    });

    return this.loader.present();
  }

  public getSites() : Promise<any> {
    let url = `_api/App_Buttons?filter={"appid":${consts.appid}}&expand=[{"table":"Notifications","key":"id","field":"notificationid"}]`;
    return this.service.get(url)
      .then( res => {
        this.services = res.json().map(button => {
          button.style = {};
          button.style['color'] = button.text_color;
          button.style['background-color'] = button.back_color;
          if(button.border == 'true'){
            button.style['border-color'] = button.border_color;
            button.style['border-width'] = button.border_width;
          }
        
          return button;
        })

        this.services.sort((a:any,b:any)=>{
          if(parseInt(a.order) > parseInt(b.order))
            return 1;
          return -1;
        })

        this.service.Sites = this.services;
      })
      .catch(error => {
        this.services = [];
      })
  }

}
