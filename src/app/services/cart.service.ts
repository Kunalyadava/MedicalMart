import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCountSubject = new BehaviorSubject<number>(this.loadCartCountFromLocalStorage());  
  cartCount$ = this.cartCountSubject.asObservable();  // Observable for cart count

  private cartItems: any[] = [];  // Track cart items

  constructor() {}

  // Load cart count from localStorage
  private loadCartCountFromLocalStorage(): number {
    const cartCount = localStorage.getItem('cartCount');
    return cartCount ? parseInt(cartCount, 10) : 0;
  }

  // Update the cart count
  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);  // Update the cart count observable
    localStorage.setItem('cartCount', count.toString());  // Save updated count in localStorage
  }

  // Update the cart items
  updateCartItems(items: any[]): void {
    this.cartItems = items;  // Update the items in the cart
  }

  getCartCount(): number {
    return this.cartCountSubject.value;  
  }

  getCartItems(): any[] {
    return this.cartItems;  
  }
}
