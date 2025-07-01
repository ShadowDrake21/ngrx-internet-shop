// angular stuff
import { Component } from '@angular/core';

// content
import { gridGalleryContent } from './content/grid-gallery.content';

@Component({
  selector: 'app-grid-gallery',
  imports: [],
  templateUrl: './grid-gallery.component.html',
  styleUrl: './grid-gallery.component.scss',
})
export class GridGalleryComponent {
  readonly ourAmbassadors = gridGalleryContent;
}
