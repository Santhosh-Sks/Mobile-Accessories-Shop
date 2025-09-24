import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit, OnDestroy {
  product: Product | null = null;
  loading = true;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.route.params.subscribe(params => {
        const productId = params['id'];
        if (productId) {
          this.loadProduct(productId);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.error = null;
    
    this.subscription.add(
      this.apiService.getProduct(id).subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Product not found';
          this.loading = false;
          console.error('Error loading product:', error);
        }
      })
    );
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product);
      alert(`${this.product.name} added to cart!`);
    }
  }

  isInCart(): boolean {
    return this.product ? this.cartService.isInCart(this.product._id!) : false;
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
