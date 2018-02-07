import { Component , Inject} from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  Sites : any;

  constructor(public navCtrl: NavController, @Inject(GeneralService) public service : GeneralService, public navParams: NavParams, public viewCtrl: ViewController) {
    this.service.Sites.then(sites => {
      this.Sites = sites;
    });
  }

  dismissView() {
    this.viewCtrl.dismiss();
  }

  ionViewDidEnter(){
    
  }

}
