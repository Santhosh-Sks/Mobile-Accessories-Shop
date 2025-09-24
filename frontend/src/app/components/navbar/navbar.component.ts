import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoggedIn = false;
  cartCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
