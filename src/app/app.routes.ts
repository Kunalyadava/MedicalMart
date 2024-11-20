import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

import { authGuard } from './services/auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

import { CartPageComponent } from './cart-page/cart-page.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { CheckoutPageComponent } from './checkout/checkout.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { OrderListComponent } from './order-list/order-list.component';


export const routes: Routes = [

  { path: '', component: SideNavComponent, children: [
      { path: '', component: DashboardComponent }, 
      { path: 'cartpage', component: CartPageComponent, canActivate: [authGuard] },
      { path: 'checkout', component: CheckoutPageComponent, canActivate: [authGuard] },
      { path: 'thank-you/:orderId', component: ThankYouComponent , canActivate: [authGuard]},
      { path: 'orderlist', component: OrderListComponent , canActivate: [authGuard]}
  ]},


  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];
