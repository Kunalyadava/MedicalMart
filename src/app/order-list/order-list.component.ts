import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NgxPrintModule } from 'ngx-print';
interface UserData {
  id: string;
  firstname: string;
  mobile: string;
  email: string;
  referralCode: string;
  password: string;
  addresses: Address[];
  cartArray: Cart[];
  orderedProducts: Order[];
}

interface Address {
  isSelected: boolean;
  city: string;
  state: string;
  pincode: string;
  isDefault: string;
}

interface Cart {
  product_id: number;
  name: string;
  manufacturer: Manufacturer;
  form: string;
  form_hi: string;
  image: string;
  images_hsh: ProductImage;
  price: Price;
  in_stock: boolean;
  product_url: string;
  id: string;
}

interface Order {
  products: Product[];
  totalPrice: number;
  uniqueOrderId: string;
  defaultAddress: Address;
  orderCreatedDate: string;
}

interface Manufacturer {
  name: string;
  url: string;
}

interface Price {
  mrp: number;
  final_price: number;
  discount_perc: number;
}

interface ProductImage {
  array: string[];
  square_images: boolean;
}

interface Product {
  product_id: number;
  name: string;
  manufacturer: Manufacturer;
  form: string;
  form_hi: string;
  image: string;
  images_hsh: ProductImage;
  price: Price;
  in_stock: boolean;
  product_url: string;
  id: string;
  quantity?: number;
}
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule,NgxPrintModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  userId: string = 'ad1d';  // Example userId
  userData: UserData | null = null;
  cartProducts: Order[] = [];
  loading: boolean = false;

  constructor(
    private http: ApiService,
    private toastr: ToastrService
  ) {
    this.userId = localStorage.getItem('userId') || '';
  }

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData(): void {
    this.loading = true;
    this.http.getUserData(this.userId).subscribe({
      next: (res: UserData) => {
        this.loading = false;
        this.userData = res;
        this.cartProducts = res?.orderedProducts || [];
      },
      error: (err:any) => {
        this.loading = false;
        console.error('Error fetching user data:', err);
        this.toastr.error('Failed to fetch user data. Please try again later.', 'Error');
      }
    });
  }
  getEstimatedDeliveryDate(orderDate: string): Date {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 15); // Add 15 days
    return date;
  }
  downloadPdf(orderId: string): void {
    const element = document.getElementById(`order-${orderId}`);
    if (!element) {
      this.toastr.error('Order details not found for PDF generation.', 'Error');
      return;
    }
  
    html2canvas(element, {
      scale: 2, // Increase quality
      useCORS: true, // Avoid cross-origin issues for external images
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190; // Fit to A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Order-${orderId}.pdf`);
    }).catch((error) => {
      console.error('Error generating PDF:', error);
      this.toastr.error('Failed to generate PDF. Please try again.', 'Error');
    });
  }
  
}
