import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-logout-confirmation',
  standalone: true,
  imports: [MatDialogModule ],
  templateUrl: './logout-confirmation.component.html',
  styleUrl: './logout-confirmation.component.scss'
})
export class LogoutConfirmationComponent {

  constructor(public dialogRef: MatDialogRef<LogoutConfirmationComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true); 
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
