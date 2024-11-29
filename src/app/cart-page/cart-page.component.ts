import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit {
  userId: string;
  cartProducts: any[] = [];
  totalPrice: number = 0;
  totalDiscount: number = 0;
  totalItems: number = 0;
  userData:any
  constructor(
    private http: ApiService,
    private toastr: ToastrService,
    private router: Router,private cartService:CartService
  ) {
    this.userId = localStorage.getItem('userId') || '';
  }

  ngOnInit(): void {
    if (this.userId) {
      this.getUserData();
    } else {
      this.toastr.warning('Please log in to view your cart', 'Login Required');
      this.router.navigate(['/login']);
    }
  }


  getUserData(): void {
    this.http.getUserData(this.userId).subscribe({
      next: (res: any) => {
        this.userData=res
        this.cartProducts = res?.cartArray || [];
        console.log(" this.cartProducts", this.cartProducts)
        this.calculateTotal();
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      }
    });
  }

  increaseQuantity(product: any): void {

    product.quantity = (product.quantity || 1) + 1;
    this.updateCart(product); 
  }
  
  decreaseQuantity(product: any): void {

    if (product.quantity > 1) {
      product.quantity--;
      this.updateCart(product); 
    }
  }
  
  removeFromCart(product: any): void {

    const updatedCart = this.cartProducts.filter((item) => item.product_id !== product.product_id);
    this.cartProducts = updatedCart;
    this.calculateTotal();
    this.updateCart({ ...product, quantity: 0 }); 
  }
  

  updateCart(product: any): void {

    const updatedCart = this.cartProducts.map((item) =>
      item.product_id === product.product_id ? { ...item, quantity: product.quantity } : item
    );

    this.cartProducts = updatedCart;
    this.calculateTotal();
  
    const updatedUserData = {
      ...this.userData,
      cartArray: updatedCart 
    };
  

    this.http.updateUser(this.userId, updatedUserData).subscribe({
      next: () => {
        this.toastr.success('Cart updated successfully');
      
        localStorage.setItem('cartArray', JSON.stringify(updatedCart));
        this.cartService.updateCartCount(updatedCart.length);
      },
      error: (err) => {
        console.error('Error updating cart:', err);
        this.toastr.error('Failed to update cart. Please try again later.');
      }
    });
  }
  
  calculateTotal(): void {
    this.totalPrice = 0;
    this.totalItems = 0;
    this.totalDiscount = 0

    this.cartProducts.forEach((product) => {
      const quantity = product.quantity || 1;
      const price = product.price?.final_price || 0;
      const mrp = product.price?.mrp || 0;

      const discount = mrp - price;
      const productDiscount = discount * quantity;


      this.totalDiscount += productDiscount;
      this.totalItems += quantity;
      this.totalPrice += price * quantity;
    });
  }

  checkout(): void {
    if (this.cartProducts.length === 0) {
      this.toastr.warning('Your cart is empty!', 'Empty Cart');
    } else {
      this.router.navigate(['/checkout']);
    }
  }
  dashboard(){
    this.router.navigate(['']);
  }
}
