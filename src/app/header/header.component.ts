import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SearchDialogComponent } from '../search-dialog/search-dialog.component';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  searchQuery: string = ''; 
  cartCount: any ;  
  userId:string  

  constructor(private dialog: MatDialog, private cartService: CartService,private router:Router,private toastr:ToastrService) {
    this.userId = localStorage.getItem('userId') || '';
  }
  ngOnInit(): void {
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;  // Update the cart count whenever it changes
    });
  }

  // Open the search dialog
  openSearchDialog() {
    const dialogRef = this.dialog.open(SearchDialogComponent, {
      width: '800px'
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performSearch(result);  
      }
    });
  }


  performSearch(query: string) {
    console.log('Searching for:', query);
    this.searchQuery = query;  
 
  }
  gotoCartpage(){
    if (!this.userId) {
      this.toastr.warning('Please login to shop for medicines.', 'Login Required');
      return;
    }else{
      this.router.navigate(['/cartpage'])
    }
   
  }
  gotoOrderlist(){
    if (!this.userId) {
      this.toastr.warning('Please login to shop for medicines.', 'Login Required');
      return;
    }else{
      this.router.navigate(['/orderlist'])
    }
  }
}
