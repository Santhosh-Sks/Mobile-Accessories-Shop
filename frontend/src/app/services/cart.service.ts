import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);

  public cartItems$ = this.cartItemsSubject.asObservable();
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        this.cartItemsSubject.next(cart);
        this.updateCartCount();
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        this.clearCart();
      }
    }
  }

  private saveCartToStorage(): void {
    const cart = this.cartItemsSubject.value;
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  private updateCartCount(): void {
    const cart = this.cartItemsSubject.value;
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    this.cartCountSubject.next(count);
  }

  addToCart(product: any, quantity: number = 1): void {
    const currentCart = this.cartItemsSubject.value;
    const existingItemIndex = currentCart.findIndex(item => item.productId === product._id);

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const cartItem: CartItem = {
        productId: product._id,
        product: product,
        quantity: quantity,
        name: product.name,
        price: product.price,
        image: product.image
      };
      currentCart.push(cartItem);
    }

    this.cartItemsSubject.next(currentCart);
    this.saveCartToStorage();
    this.updateCartCount();
  }

  removeFromCart(productId: string): void {
    const currentCart = this.cartItemsSubject.value;
    const updatedCart = currentCart.filter(item => item.productId !== productId);
    
    this.cartItemsSubject.next(updatedCart);
    this.saveCartToStorage();
    this.updateCartCount();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = this.cartItemsSubject.value;
    const itemIndex = currentCart.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      currentCart[itemIndex].quantity = quantity;
      this.cartItemsSubject.next(currentCart);
      this.saveCartToStorage();
      this.updateCartCount();
    }
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  getCartTotal(): number {
    const cart = this.cartItemsSubject.value;
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartCount(): number {
    return this.cartCountSubject.value;
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    localStorage.removeItem('cart');
    this.updateCartCount();
  }

  isInCart(productId: string): boolean {
    const cart = this.cartItemsSubject.value;
    return cart.some(item => item.productId === productId);
  }
}
