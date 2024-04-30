import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-basic-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './basic-card.component.html',
  styleUrl: './basic-card.component.scss',
})
export class BasicCardComponent {}
