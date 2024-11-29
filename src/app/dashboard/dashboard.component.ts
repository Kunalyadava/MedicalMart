import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,MdbCarouselModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  products: any[] = [];
  cart: any[] = [];
  userId: string;
  userData: any;
  cartArrayfromUserdata: any[] = [];
  destroy$ = new Subject<void>();

  constructor(
    private http: ApiService,
    private cartService: CartService,
    private toastr: ToastrService
  ) {
    this.userId = localStorage.getItem('userId') || '';
  }

  ngOnInit(): void {
    this.getUserData();
    this.getProducts();
  }

  getProducts(): void {
    this.http.getMedicines().subscribe(
      (res: any) => {
        this.products = res;
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  getUserData(): void {
    if (this.userId) {
      this.http.getUserData(this.userId).subscribe({
        next: (res: any) => {
          this.userData = res;
          console.log("userrr",this.userData)
          this.cartArrayfromUserdata = this.userData?.cartArray || [];
          this.cart = [...this.cartArrayfromUserdata];
        },
        error: (err) => {
          console.error('Error fetching user data:', err);
        }
      });
    }
  }

  addToCart(product: any): void {
    if (!this.userId) {
      this.toastr.warning('Please login to shop for medicines.', 'Login Required');
      return;
    }

    console.log('Product to add to cart:', product);
    console.log('Product ID:', product.product_id);


    const isProductInCart = this.cartArrayfromUserdata
      ? this.cartArrayfromUserdata.some(item => item.product_id === product.product_id)
      : false;


    if (isProductInCart) {
      console.log("Product already added to the cart");
      this.toastr.info('This product is already in your cart!', 'Info');
      return;
    }

    
    const productToAdd = this.products.find(item => item.product_id === product.product_id);
    if (!productToAdd) {
      console.log("Product not found");
      this.toastr.error('Product not found in the product list.', 'Error');
      return;
    }


    if (!this.cartArrayfromUserdata) {
      this.cartArrayfromUserdata = [];
    }


    this.cartArrayfromUserdata.push(productToAdd);

    this.userData = { ...this.userData, cartArray: this.cartArrayfromUserdata };

    // this.cartService.updateCartCount(this.cartArrayfromUserdata.length);
    const cartCount = this.cartArrayfromUserdata.length;
    this.cartService.updateCartCount(cartCount);
    localStorage.setItem('cartCount', cartCount.toString());


    this.http.updateUser(this.userId, this.userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
        
          this.toastr.success('Product added to cart successfully!', 'Success');
        },
        error: (error) => {
          console.error('Error updating cart:', error);
    
          this.toastr.error('Error adding product to cart. Please try again later.', 'Error');
        }
      });


    this.cartService.updateCartItems(this.cartArrayfromUserdata);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}