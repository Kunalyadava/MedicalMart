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
    this.updateCart(product); // Update the cart with the new quantity
  }
  
  decreaseQuantity(product: any): void {
    // Decrease the quantity (but ensure it's at least 1)
    if (product.quantity > 1) {
      product.quantity--;
      this.updateCart(product); // Update the cart with the new quantity
    }
  }
  
  removeFromCart(product: any): void {
    // Remove the product from the cart
    const updatedCart = this.cartProducts.filter((item) => item.product_id !== product.product_id);
    this.cartProducts = updatedCart;
    this.calculateTotal();
    this.updateCart({ ...product, quantity: 0 }); // Update the cart on the server
  }
  
  // Update cart data and recalculate total
  updateCart(product: any): void {
    // Update the cart array with new quantity or product
    const updatedCart = this.cartProducts.map((item) =>
      item.product_id === product.product_id ? { ...item, quantity: product.quantity } : item
    );
  
    // Calculate total price and total items after the cart update
    this.cartProducts = updatedCart;
    this.calculateTotal();
  
    // Use spread operator to keep the rest of the user data intact while updating the cartArray
    const updatedUserData = {
      ...this.userData,
      cartArray: updatedCart // Only updating the cartArray
    };
  
    // Send updated user data (including the updated cart) to the backend
    this.http.updateUser(this.userId, updatedUserData).subscribe({
      next: () => {
        this.toastr.success('Cart updated successfully');
        // Update the localStorage to keep the cart persistent
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
    this.totalDiscount = 0;  // Reset total discount before recalculating

    this.cartProducts.forEach((product) => {
      const quantity = product.quantity || 1;
      const price = product.price?.final_price || 0;
      const mrp = product.price?.mrp || 0;

      const discount = mrp - price;
      const productDiscount = discount * quantity;

      // Update the total discount and price
      this.totalDiscount += productDiscount;
      this.totalItems += quantity;
      this.totalPrice += price * quantity;
    });
  }

  // Checkout logic (Optional)
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
