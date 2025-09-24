import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  loading = true;

  constructor(
    private apiService: ApiService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
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

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    // You might want to show a toast/notification here
    alert(`${product.name} added to cart!`);
  }

  isInCart(product: Product): boolean {
    return this.cartService.isInCart(product._id!);
  }
}
