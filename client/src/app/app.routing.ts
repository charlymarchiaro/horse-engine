import { Routes } from '@angular/router';

// Auth
import { AuthGuardService } from './services/auth/auth-guard.service';
import { LoginComponent } from './components/auth/login/login.component';

// Layouts
import { CondensedComponent } from './@pages/layouts';

// App components
import { UserProfileComponent } from './components/auth/user-profile/user-profile.component';
import { ArticlePreviewComponent } from './components/article-preview/article-preview.component';

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
      {
        path: 'user/profile',
        component: UserProfileComponent
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'scraping-monitor',
        loadChildren: () => import('./components/scraping-monitor/scraping-monitor.module').then(m => m.ScrapingMonitorModule)
      },
      {
        path: 'article-preview/:articleId',
        component: ArticlePreviewComponent
      },
      {
        path: 'search',
        loadChildren: () => import('./components/search/search.module').then(m => m.SearchModule)
      },
      {
        // Redirect
        path: '**',
        redirectTo: 'dashboard'
      },
    ]
  }
];
