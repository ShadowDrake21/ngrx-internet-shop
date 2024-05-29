// angular stuff
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

// content
import { gridGalleryContent } from './content/grid-gallery.content';

@Component({
  selector: 'app-grid-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid-gallery.component.html',
  styleUrl: './grid-gallery.component.scss',
})
export class GridGalleryComponent {
  ourAmbassadors = gridGalleryContent;
}
