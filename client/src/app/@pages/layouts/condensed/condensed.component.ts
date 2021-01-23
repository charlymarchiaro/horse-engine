import { Component, OnInit, OnDestroy, ViewChild, HostListener, AfterViewInit, Input, ViewEncapsulation } from '@angular/core';
import { RootLayout } from '../root/root.component';
import { pagesToggleService } from '../../services/toggler.service';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth/auth.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'condensed-layout',
  templateUrl: './condensed.component.html',
  styleUrls: ['./condensed.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CondensedComponent extends RootLayout implements OnInit, OnDestroy {


  public user: User;


  public menuLinks = [
    {
      label: 'Dashboard',
      routerLink: '/dashboard',
      iconType: 'pg',
      iconName: 'home'
    },
    {
      label: 'Scraping Monitor',
      routerLink: '/scraping-monitor',
      iconType: 'pg',
      iconName: 'card'
    },
    {
      label: 'Search',
      routerLink: '/search',
      iconType: 'pg',
      iconName: 'search'
    },
  ];


  private subscription = new Subscription();


  constructor(
    toggler: pagesToggleService,
    router: Router,
    public authService: AuthService,
  ) {
    super(toggler, router);

    this.subscription.add(
      authService.loggedUser$.subscribe(u => this.user = u)
    );
  }

  ngOnInit() {
    this.authService.updateUser();
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  onUserProfileClick() {
    this.router.navigate(['user/profile']);
  }


  onLogoutClick() {
    this.authService.logout();
  }
}
