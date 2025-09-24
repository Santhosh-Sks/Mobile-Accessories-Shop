import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CartItem, CreateOrderRequest } from '../../models/order.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  currentUser: User | null = null;
  totalAmount = 0;
  isProcessing = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (!user) {
          this.router.navigate(['/login']);
          return;
        }
        this.initializeForm();
      })
    );

    // Get cart items
    this.subscription.add(
      this.cartService.cartItems$.subscribe(items => {
        this.cartItems = items;
        this.totalAmount = this.cartService.getCartTotal();
        
        if (items.length === 0) {
          this.router.navigate(['/cart']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initializeForm(): void {
    this.checkoutForm = this.formBuilder.group({
      // Shipping Address
      shippingAddress: this.formBuilder.group({
        firstName: [this.currentUser?.firstName || '', [Validators.required]],
        lastName: [this.currentUser?.lastName || '', [Validators.required]],
        email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
        phone: [this.currentUser?.phone || '', [Validators.required]],
        street: [this.currentUser?.address?.street || '', [Validators.required]],
        city: [this.currentUser?.address?.city || '', [Validators.required]],
        state: [this.currentUser?.address?.state || '', [Validators.required]],
        zipCode: [this.currentUser?.address?.zipCode || '', [Validators.required]],
        country: [this.currentUser?.address?.country || 'India', [Validators.required]]
      }),
      
      // Payment Information
      paymentMethod: ['creditCard', [Validators.required]],
      cardDetails: this.formBuilder.group({
        cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
        expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
        expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
        cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
        nameOnCard: ['', [Validators.required]]
      })
    });
  }

  onPaymentMethodChange(): void {
    const paymentMethod = this.checkoutForm.get('paymentMethod')?.value;
    const cardDetails = this.checkoutForm.get('cardDetails');
    
    if (paymentMethod === 'cod') {
      cardDetails?.disable();
    } else {
      cardDetails?.enable();
    }
  }

  getTotalWithTax(): number {
    return this.totalAmount * 1.18; // 18% tax
  }

  onSubmit(): void {
    if (this.checkoutForm.valid && !this.isProcessing) {
      this.isProcessing = true;
      
      const orderData: CreateOrderRequest = {
        items: this.cartItems, // Use the CartItems directly as they match the interface
        shippingAddress: this.checkoutForm.get('shippingAddress')?.value,
        paymentMethod: this.checkoutForm.get('paymentMethod')?.value,
        notes: 'Order placed via web application'
      };

      this.subscription.add(
        this.apiService.createOrder(orderData).subscribe({
          next: (response) => {
            // Clear cart on successful order
            this.cartService.clearCart();
            
            // Navigate to success page or order details
            alert('Order placed successfully!');
            this.router.navigate(['/']);
            this.isProcessing = false;
          },
          error: (error) => {
            console.error('Error placing order:', error);
            alert('Error placing order. Please try again.');
            this.isProcessing = false;
          }
        })
      );
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      }
    });
  }

  isFieldInvalid(fieldPath: string): boolean {
    const field = this.checkoutForm.get(fieldPath);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldPath: string): string {
    const field = this.checkoutForm.get(fieldPath);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['pattern']) return 'Please enter a valid format';
      if (field.errors['min']) return 'Value is too low';
      if (field.errors['max']) return 'Value is too high';
    }
    return '';
  }
}
