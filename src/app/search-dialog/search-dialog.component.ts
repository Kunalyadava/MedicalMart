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
  private apiKey = 'wFIMP75eG1sQEh8vVAdXykgzF4mLhDw3';
  selectedOption: string = 'Medicine'; 
  searchString: string = ''; 
  searchResults: any[] = []; 
  isLoading: boolean = false; 

  constructor(
    public dialogRef: MatDialogRef<SearchDialogComponent>,
    private http: ApiService, 
    private toastr: ToastrService
  ) {}

  searchMedicine(): void {
    if (!this.searchString.trim()) {
      this.toastr.error('Please enter a search item.', 'Error');
      return;
    }

    this.isLoading = true; 

    const requestBody = {
      searchstring: this.searchString,
      apikey: this.apiKey,
      category: this.selectedOption
    };

    this.http.searchProducts(requestBody).subscribe(
      (response) => {
        this.isLoading = false;  
        if (response.status_code === '1') {
          this.searchResults = response.data.result || [];
          if (this.searchResults.length === 0) {
            this.toastr.info('No results found for your search.', 'Information');
          } else {
            this.toastr.success('Search completed successfully.');
          }
        } else {
          this.toastr.error('Error: ' + response.status_message, 'Error');
        }
      },
      (error) => {
        this.isLoading = false; 
        console.error('Error fetching search results:', error);
        this.toastr.error('Something went wrong. Please try again later.', 'Error');
      }
    );
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
