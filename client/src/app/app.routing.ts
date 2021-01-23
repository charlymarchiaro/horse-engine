import { Routes } from '@angular/router';

// Auth
import { AuthGuardService } from './services/auth/auth-guard.service';
import { LoginComponent } from './components/auth/login/login.component';

// Layouts
import { CondensedComponent } from './@pages/layouts';

// App components
import { UserProfileComponent } from './components/auth/user-profile/user-profile.component';
import { MainComponent as ScrapingMonitor } from './components/scraping-monitor/main.component';
import { MainComponent as KeywordSearch } from './components/keyword-search/main.component';
import { MainComponent as Search } from './components/search/main.component';
import { MainComponent as Dashboard } from './components/dashboard/main.component';

export const AppRoutes: Routes = [
  {
    path: 'auth/login', component: LoginComponent
  },
  {
    path: '',
    data: { breadcrumb: 'Home' },
    component: CondensedComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: 'user/profile', component: UserProfileComponent },
      { path: 'dashboard', component: Dashboard },
      { path: 'scraping-monitor', component: ScrapingMonitor },
      { path: 'keyword-search', component: KeywordSearch },
      { path: 'search', component: Search },
      { path: '**', redirectTo: 'dashboard' },
    ]
  }
];
