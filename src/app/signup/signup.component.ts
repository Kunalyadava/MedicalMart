import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgOtpInputModule } from 'ng-otp-input'; 
import { mobileValidator, noSpecialCharsValidator, passwordValidator, pincodeValidator } from '../commonfunctions/validators';
import { ApiService } from '../services/api.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    ToastrModule,
    NgOtpInputModule, 
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  termsChecked: boolean = false; 
  formSubmitted: boolean = false;
  registerForm!: FormGroup;
  showReferralInput = false;
  selectedIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private http: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, noSpecialCharsValidator(),Validators.maxLength(25)]],
      mobile: ['', [Validators.required, mobileValidator()]],
      email: ['', [Validators.required, Validators.email]],
      referralCode: [''],
      password: ['', [Validators.required, passwordValidator()]],
      addresses: this.fb.array([this.createAddressGroup()]),
    });
  }

  get addresses(): FormArray {
    return this.registerForm.get('addresses') as FormArray;
  }
  onTermsChange(event: any): void {
    this.termsChecked = event.target.checked;
  }
  
  createAddressGroup(): FormGroup {
    return this.fb.group({
      isSelected: [false],
      city: ['', [Validators.required, noSpecialCharsValidator()]],
      state: ['', [Validators.required]],
      pincode: ['', [Validators.required, pincodeValidator()]],
      isDefault: ['no'],
    });
  }

  addAddress(): void {
    this.addresses.push(this.createAddressGroup());
  }

removeAddress(): void {
  // Get all selected addresses (those with isSelected = true)
  const selectedAddresses = this.addresses.controls.filter(
    (group) => group.get('isSelected')?.value
  );

  // If no address is selected, show a warning
  if (selectedAddresses.length === 0) {
    this.toastr.warning('Please select at least one address to delete.');
    return;
  }

  // If all addresses are selected, prevent deletion
  if (selectedAddresses.length === this.addresses.length) {
    this.toastr.warning('You cannot delete all addresses. At least one address must remain.');
    return;
  }

  // Ensure at least one address remains
  if (this.addresses.length === 1) {
    this.toastr.warning('At least one address is required.');
    return;
  }

  // Remove the selected addresses
  selectedAddresses.forEach((addressGroup) => {
    const index = this.addresses.controls.indexOf(addressGroup);
    this.addresses.removeAt(index);
  });
}


  onDefaultChange(selectedIndex: number): void {
    // Make sure only one address can be default
    this.addresses.controls.forEach((group, index) => {
      const control = group.get('isDefault');
      if (control) {
        control.setValue(index === selectedIndex ? 'yes' : 'no');
      }
    });
  }
  toggleReferral(): void {
    this.showReferralInput = !this.showReferralInput;
  }
  checkDefaultAddress(): boolean {
    return this.addresses.controls.some((group) => group.get('isDefault')?.value === 'yes');
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.registerForm.markAllAsTouched();
  
    // Check if default address is selected
    if (!this.checkDefaultAddress()) {
      this.toastr.warning('Please select a default address.');
      return;
    }
  
    // Check if terms and conditions are accepted
    if (!this.termsChecked) {
      this.toastr.warning('Please agree to the terms of use');
      return;
    }
  
    // Check if the form is valid
    if (this.registerForm.invalid) {
      this.toastr.warning('Please fill out all required fields.');
      return;
    }
   this.http.login().pipe(
      map((res: any[]) => res.find(a => a.mobile === this.registerForm.value.mobile))
    ).subscribe(
      (user) => {
        if (user) {
          this.toastr.error('An user with this mobile already exists. Please use another mobile to register.');
        } else {
          const formData = this.registerForm.value;
  
          this.http.signUp(formData).subscribe(
            (response) => {
              this.toastr.success('Registration successful!');
              this.router.navigate(['/login']);
            },
            (error) => {
              this.toastr.error('Registration failed. Please try again.');
            }
          );
        }
      },
      (error) => {
        // Handle errors from the login check (optional)
        this.toastr.error('Error checking existing users. Please try again.');
      }
    );
  }
  
  
}