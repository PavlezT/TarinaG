import { Component, Inject } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    @Inject(GeneralService) public service : GeneralService) {
  }

  dismissView() {
    this.viewCtrl.dismiss();
  }

}
