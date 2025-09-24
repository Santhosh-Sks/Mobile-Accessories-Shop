import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service.js';
import { CartService } from '../../services/cart.service.js';

/**
 * @type {import('@angular/core').Component}
 */
export const NavbarComponent = Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})(class NavbarComponent {
  constructor(authService, cartService, router) {
    this.authService = authService;
    this.cartService = cartService;
    this.router = router;
    
    this.currentUser = null;
    this.isLoggedIn = false;
    this.cartCount = 0;
    this.subscriptions = [];
  }

  ngOnInit() {
    // Subscribe to auth status
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe(status => {
        this.isLoggedIn = status;
      })
    );

    // Subscribe to cart count
    this.subscriptions.push(
      this.cartService.cartCount$.subscribe(count => {
        this.cartCount = count;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isAdmin() {
    return this.authService.isAdmin();
  }
});
