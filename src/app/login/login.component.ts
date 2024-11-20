import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service'; // Assuming ApiService is imported
import { ToastrService } from 'ngx-toastr'; // Assuming Toastr is imported
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService ,
    private cartService:CartService
  ) {
    this.loginForm = this.fb.group({
      mobile: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10}$')] 
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  onLogin() {
    if (this.loginForm.valid) {
     this.apiService.login().subscribe({
        next: (res) => {
          const inputMobile = this.loginForm.value.mobile ? this.loginForm.value.mobile : '';
          const inputPassword = this.loginForm.value.password ? this.loginForm.value.password : '';
          const user = res.find((a: any) => {
            const storedMobile = a.mobile ? a.mobile : '';
            return storedMobile === inputMobile;
          });
          if (user) {
            if (user.password === inputPassword) {
              this.toastr.success('Login successful');
              localStorage.setItem('isLoggedIn','true');
              localStorage.setItem('userId', user.id);
              this.loginForm.reset();
              const cartArray = user.cartArray || [];
              localStorage.setItem('cartArray', JSON.stringify(cartArray));
              const cartCount = cartArray.length;
              this.cartService.updateCartCount(cartCount);
              this.router.navigate(['/Homepage']);
            } else {
              this.toastr.error('Incorrect password');
            }
          } else {
            this.toastr.error('User not found');
          }
        },
        error: (error) => {
        },
        complete: () => {
        }
      });
    }
  }
}
