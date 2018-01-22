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
    this.Sites = [];

    this.Sites = [
      {
        icon : 'https://sasd',
        name : 'Website',
        link : 'https://asdas'
      }
    ]
  }

  dismissView() {
    this.viewCtrl.dismiss();
  }

  ionViewDidEnter(){
    this.getSites();
  }

  public getSites() : Promise<any> {
    return Promise.resolve();
    // let url = `ewewewe`;
    // return this.service.get(url)
    //   .then( res => {
    //     // this.Sites = res.json();
    //   })
    //   .catch(error => {
    //     this.Sites = [];
    //   })
  }

}
