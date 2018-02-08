import { Component , Inject} from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { GeneralService } from '../../utils/service';
import { FCM } from '@ionic-native/fcm';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  Sites : any;

  constructor(public navCtrl: NavController, @Inject(GeneralService) public service : GeneralService,
    public navParams: NavParams, public viewCtrl: ViewController,private fcm: FCM
  ) {
    this.service.Sites.then(sites => {
      this.Sites = sites.map(but=>{
        but.checked = (window.localStorage.getItem('but'+but.id) == 'false'? false : true );
        return but;
      });
    });
  }

  dismissView() {
    this.viewCtrl.dismiss();
  }

  public changeToggle(button) : boolean {
    if(button.checked == true){
      button.checked = false;
      window.localStorage.setItem('but'+button.id,'false');
      this.fcm.unsubscribeFromTopic(button.notificationid);
    } else {
      button.checked = true;
      window.localStorage.setItem('but'+button.id,'true');
      this.fcm.subscribeToTopic(button.notificationid);
    }
    return button.checked;
  }

}
