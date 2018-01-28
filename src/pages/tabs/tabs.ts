import { Component, Inject } from '@angular/core';

import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { TeeTimesPage } from '../tee-times/tee-times';
import { LatestNewsPage } from '../latest-news/latest-news';
import { PartnersPage } from '../partners/partners';

import { GeneralService } from '../../utils/service';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = TeeTimesPage;
  tab3Root = LatestNewsPage;
  tab4Root = PartnersPage;
  tab5Root = ContactPage;

  constructor( @Inject(GeneralService) public service : GeneralService) {

  }
}
