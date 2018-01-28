import { Component, Inject } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  constructor(public navCtrl: NavController, public viewCtrl: ViewController,@Inject(GeneralService) public service : GeneralService) {

  }

  dismissView() {
    this.viewCtrl.dismiss();
  }

}
