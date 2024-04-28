import { Component } from '@angular/core';
import { sponsors } from './content/sponsors.content';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-sponsors',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './sponsors.component.html',
  styleUrl: './sponsors.component.scss',
})
export class SponsorsComponent {
  sponsors = sponsors;
}
