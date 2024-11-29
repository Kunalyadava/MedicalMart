import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCountSubject = new BehaviorSubject<number>(this.loadCartCountFromLocalStorage());  
  cartCount$ = this.cartCountSubject.asObservable();  

  private cartItems: any[] = [];  

  constructor() {}


  private loadCartCountFromLocalStorage(): number {
    const cartCount = localStorage.getItem('cartCount');
    return cartCount ? parseInt(cartCount, 10) : 0;
  }


  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);  
    localStorage.setItem('cartCount', count.toString());  
  }


  updateCartItems(items: any[]): void {
    this.cartItems = items;  
  }

  getCartCount(): number {
    return this.cartCountSubject.value;  
  }

  getCartItems(): any[] {
    return this.cartItems;  
  }
}
