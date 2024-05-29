// angular stuff
import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// content
import { sponsors } from './content/sponsors.content';

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
