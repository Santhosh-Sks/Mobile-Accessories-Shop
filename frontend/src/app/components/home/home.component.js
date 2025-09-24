import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service.js';
import { CartService } from '../../services/cart.service.js';

/**
 * @type {import('@angular/core').Component}
 */
export const HomeComponent = Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})(class HomeComponent {
  constructor(apiService, cartService) {
    this.apiService = apiService;
    this.cartService = cartService;
    
    this.featuredProducts = [];
    this.loading = true;
  }

  ngOnInit() {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.apiService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.loading = false;
      }
    });
  }

  addToCart(product) {
    this.cartService.addToCart(product);
    // You might want to show a toast/notification here
    alert(`${product.name} added to cart!`);
  }

  isInCart(product) {
    return this.cartService.isInCart(product._id);
  }
});
