import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutPageComponent implements OnInit {
  userId: string;
  userData: any;
  cartProducts: any[] = [];
  checkoutForm!: FormGroup;
  totalPrice: number = 0;
  cardDetailsVisible: boolean = false;
  upiDetailsVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private http: ApiService,
    private cartService:CartService
  ) {
    this.userId = localStorage.getItem('userId') || '';
  }

  ngOnInit(): void {
    if (this.userId) {
      this.getUserData(); // Fetch user data including cart
    } else {
      this.toastr.warning('Please log in to proceed with checkout', 'Login Required');
      this.router.navigate(['/login']);
    }

    // Initialize the checkout form
    this.checkoutForm = this.fb.group({
      paymentMethod: ['', Validators.required], // Payment method (card or UPI)
      cardNumber: ['', [Validators.pattern(/^\d{16}$/)]], // Card number (16 digits)
      cvv: ['', [Validators.pattern(/^\d{3}$/)]], // CVV (3 digits)
      upiId: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z]+$/)
        ]
      ]
    });
  
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(value => {
      this.onPaymentMethodChange(value);
    });
  }

 
  getUserData(): void {
    this.http.getUserData(this.userId).subscribe({
      next: (res: any) => {
        this.userData = res;
        this.cartProducts = res?.cartArray || [];
        this.calculateTotal(); 
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      }
    });
  }


  calculateTotal(): void {
    this.totalPrice = 0;
    this.cartProducts.forEach((product) => {
      const price = product.price?.final_price || product.price?.mrp || 0;
      const quantity = product.quantity || 1;
      this.totalPrice += price * quantity;
    });
  }


  onPaymentMethodChange(method: string): void {
    this.cardDetailsVisible = method === 'card';
    this.upiDetailsVisible = method === 'upi';

    if (method === 'card') {
      this.checkoutForm.get('cardNumber')?.setValidators([Validators.pattern(/^\d{16}$/), Validators.required]);
      this.checkoutForm.get('cvv')?.setValidators([Validators.pattern(/^\d{3}$/), Validators.required]);
      this.checkoutForm.get('upiId')?.clearValidators();
    } else if (method === 'upi') {
      this.checkoutForm.get('upiId')?.setValidators([  Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z]+$/), Validators.required]);
      this.checkoutForm.get('cardNumber')?.clearValidators();
      this.checkoutForm.get('cvv')?.clearValidators();
    } else {
      this.checkoutForm.get('cardNumber')?.clearValidators();
      this.checkoutForm.get('cvv')?.clearValidators();
      this.checkoutForm.get('upiId')?.clearValidators();
    }

   
    this.checkoutForm.get('cardNumber')?.updateValueAndValidity();
    this.checkoutForm.get('cvv')?.updateValueAndValidity();
    this.checkoutForm.get('upiId')?.updateValueAndValidity();
  }


  processPayment(): void {

    if (!this.userId) {
      this.toastr.warning('Please login to shop for medicines.', 'Login Required');
      return;
    }
    if (this.checkoutForm.invalid) {
      this.toastr.error('Please fill out all the required fields.');
      return;
    }
  
 
    const totalPrice = this.totalPrice;
  
  
    const defaultAddress = this.userData.addresses.find((address:any) => address.isDefault === 'yes');
  
   
    const uniqueOrderId = `ORD${Date.now()}`;

    const orderData = {
      products: [...this.cartProducts], 
      totalPrice: totalPrice,
      uniqueOrderId: uniqueOrderId,
      defaultAddress: defaultAddress,
      orderCreatedDate: new Date().toISOString() // Current date and time
    };
  
    // If orderedProducts already exists, add the new order to the array
    const updatedUserData = {
      ...this.userData, // Spread operator to keep other properties intact
      orderedProducts: this.userData.orderedProducts ? [...this.userData.orderedProducts, orderData] : [orderData], 
      cartArray: [] // Clear the cart
    };
  
    // Simulate an API call to update user data with the new order// Add the order to orderedProducts
    this.http.updateUser(this.userId, updatedUserData).subscribe({
      next: (response) => {
        this.toastr.success('Order placed successfully!');
        localStorage.setItem('cartArray', JSON.stringify([]));
        // Update cart count in CartService (set to 0 since cart is empty)
        this.cartService.updateCartCount(0);
  
        // Redirect to the Thank You page with the orderId as a route parameter
        this.router.navigate(['/thank-you', uniqueOrderId]);
      },
      error: (error) => {
        console.error('Error updating user data:', error);
        this.toastr.error('Something went wrong while processing your payment.');
      }
    });
  }
  
}
