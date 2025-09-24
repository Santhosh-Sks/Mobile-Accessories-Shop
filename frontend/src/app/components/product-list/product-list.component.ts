import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductFilter, ProductResponse } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  brands: string[] = [];
  loading = true;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  limit = 12;

  // Filters
  filters: ProductFilter = {
    page: 1,
    limit: 12,
    sort: 'createdAt',
    order: 'desc'
  };

  // Search and filter UI state
  searchTerm = '';
  selectedCategory = '';
  selectedBrand = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'createdAt';
  sortOrder = 'desc';

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    
    // Subscribe to route query parameters
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.selectedBrand = params['brand'] || '';
      this.searchTerm = params['search'] || '';
      this.currentPage = Number(params['page']) || 1;
      
      this.updateFilters();
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadBrands(): void {
    this.apiService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
      }
    });
  }

  updateFilters(): void {
    this.filters = {
      page: this.currentPage,
      limit: this.limit,
      category: this.selectedCategory || undefined,
      brand: this.selectedBrand || undefined,
      search: this.searchTerm || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      sort: this.sortBy,
      order: this.sortOrder as 'asc' | 'desc'
    };
  }

  loadProducts(): void {
    this.loading = true;
    this.updateFilters();
    
    this.apiService.getProducts(this.filters).subscribe({
      next: (response: ProductResponse) => {
        this.products = response.products;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalProducts = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.currentPage = 1;
    this.loadProducts();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    alert(`${product.name} added to cart!`);
  }

  isInCart(product: Product): boolean {
    return this.cartService.isInCart(product._id!);
  }

  getPaginationArray(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
