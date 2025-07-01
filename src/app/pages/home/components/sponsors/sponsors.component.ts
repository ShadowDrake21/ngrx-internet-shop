// angular stuff
import { Component } from '@angular/core';
import { NgOptimizedImage, TitleCasePipe } from '@angular/common';

// content
import { sponsors } from './content/sponsors.content';

@Component({
  selector: 'app-sponsors',
  imports: [TitleCasePipe, NgOptimizedImage],
  templateUrl: './sponsors.component.html',
  styleUrl: './sponsors.component.scss',
})
export class SponsorsComponent {
  readonly sponsors = sponsors;
}
