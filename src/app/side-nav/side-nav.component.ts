import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HeaderComponent } from '../header/header.component';
import { CartService } from '../services/cart.service';
import { LogoutConfirmationComponent } from '../logout-confirmation/logout-confirmation.component';
@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    CommonModule,
    RouterModule,
    HeaderComponent,
    MatDialogModule,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent {
  title = 'material-responsive-sidenav';
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile = true;
  isCollapsed = true;
  isUserLoggedIn = false;
  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    private dialog: MatDialog,
    private cartService:CartService,
  ) {}
  ngOnInit() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.isUserLoggedIn = isLoggedIn;
    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      if (screenSize.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }

  toggleMenu() {
    if (this.isMobile) {
      this.sidenav.toggle();
      this.isCollapsed = false;
    } else {
      this.sidenav.open();
      this.isCollapsed = !this.isCollapsed;
    }
  }
  signup() {
    console.log('Redirecting to signup page...');
  }
  login() {
    localStorage.setItem('isLoggedIn', 'true');
    this.isUserLoggedIn = true;
    this.router.navigate(['/login']);
  }

  logout() {
    const dialogRef = this.dialog.open(LogoutConfirmationComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        localStorage.clear();
        this.cartService.updateCartCount(0);  
        this.cartService.updateCartItems([]);
        this.isUserLoggedIn = false;
        this.router.navigate(['/']);
      }
    });
  }
}
