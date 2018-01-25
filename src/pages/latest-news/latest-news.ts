import { Component, Inject } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-latest-news',
  templateUrl: 'latest-news.html',
})
export class LatestNewsPage {

  news: Array<{ date: string, icon: string, text: string }>;

  constructor(public navCtrl: NavController, @Inject(GeneralService) public service : GeneralService) {
    this.getNews();
  }

  getNews() {
    this.news = [
      { date: '27.7.2017 17:09', text: 'Mikko pelaa huomenna mitalipeleissä. Isot Tsempit.', icon: 'fblogo' },
      { date: '27.7.2017 15:23', text: 'Klubiravintola Neliapila: ALKUVIIKON MENU 31.8.-4.8. ', icon: 'aslogo' },
      { date: '27.7.2017 13:19', text: '@lateruuska on Suomen mestari jälleen...', icon: 'instalogo' },
      { date: '26.7.2017 07:32', text: 'HUOMIO! Alkukaudesta Vanhan Tarinan väylillä 14 ja 15 tavattu...', icon: 'dmlogo' },
      { date: '20.7.2017 19:02', text: '@GoGolffi Lauri Ruuska lähtee lyömään yhdellä päälle...', icon: 'twitterlogo' },
      { date: '17.7.2017 02:09', text: 'TarinaBattlessä savolaiset huippuseurat KalPan, KuPsin ja...', icon: 'youtubelogo' },
      { date: '12.7.2017 21:26', text: 'Tulokset: Naisten Yara-sunnuntai with Daily Sports (A) Uusi Tarina...', icon: 'nglogo' }
    ]
  }

  openNews(n) {
    console.log('clicked: ' + n.text);
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

}