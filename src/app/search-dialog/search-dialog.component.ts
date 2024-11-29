import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon'; 
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-search-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule, MatOptionModule, MatSelectModule,
    MatIconModule, FormsModule, CommonModule
  ],
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss']
})
export class SearchDialogComponent {
  searchString: string = ''; 
  selectedCategory: string = ''; 
  searchResults: any[] = []; 
  products: any[] = [];
  cart: any[] = [];  

  constructor(
    public dialogRef: MatDialogRef<SearchDialogComponent>,
    private http: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.searchMedicine(); 
  }

  searchMedicine(): void {
    this.http.getMedicines().subscribe(
      (res: any) => {
        this.products = res;
        this.filterProducts();
      },
      (error) => {
        console.error('Error fetching products:', error);
        this.toastr.error('Failed to fetch products!');
      }
    );
  }

  filterProducts(): void {
    if (!this.searchString && !this.selectedCategory) {
      this.searchResults = [];  
      return;
    }

    this.searchResults = this.products.filter((product) => {
      const matchesSearchString = product.name.toLowerCase().includes(this.searchString.toLowerCase());
      const matchesCategory = this.selectedCategory ? product.category === this.selectedCategory : true;
      return matchesSearchString && matchesCategory;
    });
  }


  onSearchInputChange(): void {
    this.filterProducts();
  }


  onCategoryChange(): void {
    this.filterProducts();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  addToCart(product: any): void {
    this.cart.push(product);  
    this.toastr.success(`${product.name} added to cart!`);
  }
}
