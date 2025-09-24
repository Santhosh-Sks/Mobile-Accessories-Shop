import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component.js';

/**
 * @type {import('@angular/core').Component}
 */
export const App = Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})(class App {
  constructor() {
    this.title = 'Mobile Accessories Shop';
  }
});
