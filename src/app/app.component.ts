import { Component, Inject } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { GeneralService } from '../utils/service';
import { Toast } from '../utils/toast';

import { FCM } from '@ionic-native/fcm';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,private fcm: FCM,
    @Inject(GeneralService) public service : GeneralService, @Inject(Toast) public toast : Toast
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.proceedNotification();
    });
  }

  public proceedNotification() : void {

    this.service.getApp.then(()=>{
      this.fcm.subscribeToTopic('DirectMessages'+this.service.app.id);
    })

    this.service.Sites.then(sites => {
      sites.map(but=>{
        but.checked = (window.localStorage.getItem('but'+but.id) == 'false'? false : true );
        if(but.checked)
          this.fcm.subscribeToTopic(but.notificationid);
      });
    });

    this.fcm.onNotification().subscribe(data=>{
      console.log('tapped data',data);
      if(data.wasTapped){
        console.log("Received in background");
      } else {
        console.log("Received in foreground");
        this.toast.showToast(data.content);
      };
      // let messages : any = window.localStorage.getItem('DirectMessages');
      // messages = JSON.parse(messages || '[]');
      // messages.push({date : (new Date(Date.now())).toJSON(), content : data.content, logourl : 'assets/imgs/dmlogo.png' })
      // window.localStorage.setItem('DirectMessages', JSON.stringify(messages));
    })

  }

}
