import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit, OnDestroy {
  products: Product[] = [];
  orders: Order[] = [];
  productForm!: FormGroup;
  editingProduct: Product | null = null;
  showProductForm = false;
  loading = false;
  error = '';
  success = '';
  
  // Statistics
  totalProducts = 0;
  totalOrders = 0;
  totalRevenue = 0;
  pendingOrders = 0;

  private subscription: Subscription = new Subscription();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initProductForm();
    this.loadProducts();
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initProductForm(): void {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      image: ['', [Validators.required]],
      stock: ['', [Validators.required, Validators.min(0)]],
      brand: ['', [Validators.required]],
      specifications: this.formBuilder.group({
        color: [''],
        material: [''],
        compatibility: [''],
        features: ['']
      })
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.subscription.add(
      this.apiService.getProducts().subscribe({
        next: (response) => {
          this.products = response.products;
          this.totalProducts = response.products.length;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load products';
          this.loading = false;
        }
      })
    );
  }

  loadOrders(): void {
    this.subscription.add(
      this.apiService.getOrders().subscribe({
        next: (orders: Order[]) => {
          this.orders = orders;
          this.totalOrders = orders.length;
          this.totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
          this.pendingOrders = orders.filter((order: Order) => order.orderStatus === 'pending').length;
        },
        error: (error: any) => {
          console.error('Failed to load orders:', error);
        }
      })
    );
  }

  onSubmitProduct(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const productData = this.productForm.value;

    if (this.editingProduct) {
      // Update existing product
      this.subscription.add(
        this.apiService.updateProduct(this.editingProduct._id!, productData).subscribe({
          next: () => {
            this.success = 'Product updated successfully!';
            this.resetForm();
            this.loadProducts();
          },
          error: (error) => {
            this.error = 'Failed to update product';
            this.loading = false;
          }
        })
      );
    } else {
      // Create new product
      this.subscription.add(
        this.apiService.createProduct(productData).subscribe({
          next: () => {
            this.success = 'Product created successfully!';
            this.resetForm();
            this.loadProducts();
          },
          error: (error) => {
            this.error = 'Failed to create product';
            this.loading = false;
          }
        })
      );
    }
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.showProductForm = true;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      brand: product.brand,
      specifications: product.specifications
    });
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.subscription.add(
        this.apiService.deleteProduct(productId).subscribe({
          next: () => {
            this.success = 'Product deleted successfully!';
            this.loadProducts();
          },
          error: (error) => {
            this.error = 'Failed to delete product';
          }
        })
      );
    }
  }

  updateOrderStatus(orderId: string, status: string): void {
    this.subscription.add(
      this.apiService.updateOrderStatus(orderId, status).subscribe({
        next: () => {
          this.success = 'Order status updated successfully!';
          this.loadOrders();
        },
        error: (error) => {
          this.error = 'Failed to update order status';
        }
      })
    );
  }

  onOrderStatusChange(event: Event, orderId: string): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.updateOrderStatus(orderId, target.value);
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.editingProduct = null;
    this.showProductForm = false;
    this.loading = false;
  }

  toggleProductForm(): void {
    this.showProductForm = !this.showProductForm;
    if (!this.showProductForm) {
      this.resetForm();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  trackByProductId(index: number, product: Product): string {
    return product._id!;
  }

  trackByOrderId(index: number, order: Order): string {
    return order._id!;
  }

  get f() { return this.productForm.controls; }
}
