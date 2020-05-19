import { Routes } from '@angular/router';
//Layouts
import {
  CondensedComponent,
  BlankComponent,
  CorporateLayout,
  SimplyWhiteLayout,
  ExecutiveLayout,
  CasualLayout,
  BlankCasualComponent,
  BlankCorporateComponent,
  BlankSimplywhiteComponent
} from './@pages/layouts';
import { MainComponent as ScrapingMonitor } from './components/scraping-monitor/main.component';
import { MainComponent as KeywordSearch } from './components/keyword-search/main.component';
import { MainComponent as Dashboard } from './components/dashboard/main.component';

export const AppRoutes: Routes = [

  {
    path: '', data: { breadcrumb: 'Home' }, component: CondensedComponent,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'scraping-monitor', component: ScrapingMonitor },
      { path: 'keyword-search', component: KeywordSearch },
      { path: '**', redirectTo: '' }
    ]
  },
  {
    path: 'casual',
    data: {
      breadcrumb: 'Home'
    },
    component: CasualLayout
  },
  {
    path: 'executive',
    data: {
      breadcrumb: 'Home'
    },
    component: ExecutiveLayout
  },
  {
    path: 'simplywhite',
    data: {
      breadcrumb: 'Home'
    },
    component: SimplyWhiteLayout
  },
  {
    path: 'corporate',
    data: {
      breadcrumb: 'Home'
    },
    component: CorporateLayout
  },
];
