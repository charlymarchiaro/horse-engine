import { Routes } from '@angular/router';
//Layouts
import {
  CondensedComponent
} from './@pages/layouts';
import { MainComponent as ScrapingMonitor } from './components/scraping-monitor/main.component';
import { MainComponent as KeywordSearch } from './components/keyword-search/main.component';
import { MainComponent as Search } from './components/search/main.component';
import { MainComponent as Dashboard } from './components/dashboard/main.component';

export const AppRoutes: Routes = [

  {
    path: '', data: { breadcrumb: 'Home' }, component: CondensedComponent,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'scraping-monitor', component: ScrapingMonitor },
      { path: 'keyword-search', component: KeywordSearch },
      { path: 'search', component: Search },
      { path: '**', redirectTo: 'dashboard' },
    ]
  }
];
