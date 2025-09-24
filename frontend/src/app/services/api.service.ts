import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductFilter, ProductResponse } from '../models/product.model';
import { LoginRequest, RegisterRequest, AuthResponse, User, ChangePasswordRequest } from '../models/user.model';
import { Order, CreateOrderRequest, OrderResponse } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Authentication
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, loginData);
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, registerData);
  }

  getProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.baseUrl}/auth/profile`, {
      headers: this.getHeaders()
    });
  }

  updateProfile(userData: Partial<User>): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.baseUrl}/auth/profile`, userData, {
      headers: this.getHeaders()
    });
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/auth/change-password`, passwordData, {
      headers: this.getHeaders()
    });
  }

  // Products
  getProducts(filters?: ProductFilter): Observable<ProductResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProductResponse>(`${this.baseUrl}/products`, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/featured/list`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/categories/list`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/brands/list`);
  }

  // Admin Products
  createProduct(productData: Partial<Product>): Observable<{ message: string; product: Product }> {
    return this.http.post<{ message: string; product: Product }>(`${this.baseUrl}/products`, productData, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: string, productData: Partial<Product>): Observable<{ message: string; product: Product }> {
    return this.http.put<{ message: string; product: Product }>(`${this.baseUrl}/products/${id}`, productData, {
      headers: this.getHeaders()
    });
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/products/${id}`, {
      headers: this.getHeaders()
    });
  }

  getAdminProducts(filters?: any): Observable<ProductResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProductResponse>(`${this.baseUrl}/products/admin/all`, {
      params,
      headers: this.getHeaders()
    });
  }

  // Orders
  createOrder(orderData: CreateOrderRequest): Observable<{ message: string; order: Order }> {
    return this.http.post<{ message: string; order: Order }>(`${this.baseUrl}/orders`, orderData, {
      headers: this.getHeaders()
    });
  }

  getMyOrders(filters?: any): Observable<OrderResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<OrderResponse>(`${this.baseUrl}/orders/my`, {
      params,
      headers: this.getHeaders()
    });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`, {
      headers: this.getHeaders()
    });
  }

  cancelOrder(id: string): Observable<{ message: string; order: Order }> {
    return this.http.put<{ message: string; order: Order }>(`${this.baseUrl}/orders/${id}/cancel`, {}, {
      headers: this.getHeaders()
    });
  }

  // Admin Orders
  getAllOrders(filters?: any): Observable<OrderResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<OrderResponse>(`${this.baseUrl}/orders`, {
      params,
      headers: this.getHeaders()
    });
  }

  getOrderStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/orders/stats/summary`, {
      headers: this.getHeaders()
    });
  }

  // Admin Orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/admin/all`, {
      headers: this.getHeaders()
    });
  }

  updateOrderStatus(orderId: string, status: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/orders/${orderId}/status`, 
      { status }, 
      { headers: this.getHeaders() }
    );
  }

  // Wishlist
  addToWishlist(productId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/users/wishlist/${productId}`, {}, {
      headers: this.getHeaders()
    });
  }

  removeFromWishlist(productId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/users/wishlist/${productId}`, {
      headers: this.getHeaders()
    });
  }

  getWishlist(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/users/wishlist/my`, {
      headers: this.getHeaders()
    });
  }
}
