import { Component, Inject } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';

import { AboutPage } from '../about/about';
import { AccountsPage } from '../accounts/accounts';
import { FeedbackPage } from '../feedback/feedback';
import { NotificationsPage } from '../notifications/notifications';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  accounts: Array<{ name: string, icon: string, component: any }>;
  helps: Array<{ name: string, icon: string, component: any }>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, @Inject(GeneralService) public service : GeneralService) {
    this.setAccountItems();
    this.setHelpItems();
  }

  setAccountItems() {
    this.accounts = [
      { name: 'Facebook', icon: 'fblogo', component: AccountsPage },
      { name: 'Instagram', icon: 'instalogo', component: AccountsPage },
      { name: 'Twitter', icon: 'twitterlogo', component: AccountsPage },
      { name: 'YouTube', icon: 'youtubelogo', component: AccountsPage },
      { name: 'NexGolf', icon: 'nglogo', component: AccountsPage }
    ]
  }

  setHelpItems() {
    this.helps = [
      { name: this.service.dic.Givefeedback, icon: 'md-star', component: FeedbackPage },
      { name: this.service.dic.About, icon: 'md-help-circle', component: AboutPage }
    ]
  }

  openAccountSettings(i) {
    let modal = this.modalCtrl.create(i.component, {
      pageName: i.name
    });
    modal.present();
  }

  openNotificationSettings() {
    let modal = this.modalCtrl.create(NotificationsPage);
    modal.present();
  }

  openHelpItem(h) {
    let modal = this.modalCtrl.create(h.component);
    modal.present();
  }

}
