import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/order.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalAmount = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.cartService.cartItems$.subscribe((items: CartItem[]) => {
        this.cartItems = items;
        this.calculateTotal();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  calculateTotal(): void {
    this.totalAmount = this.cartService.getCartTotal();
  }

  updateQuantity(productId: string, newQuantity: number): void {
    this.cartService.updateQuantity(productId, newQuantity);
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  isLoggedIn(): boolean {
    // Check if user is logged in via observable
    let loggedIn = false;
    this.authService.isLoggedIn$.subscribe(status => loggedIn = status).unsubscribe();
    return loggedIn;
  }

  getCartCount(): number {
    return this.cartService.getCartCount();
  }

  trackByProductId(index: number, item: CartItem): string {
    return item.productId;
  }
}
