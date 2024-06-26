// angular stuff
import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// content
import {
  IProductSliderImage,
  productSliderImages,
} from './content/product-slider.content';

@Component({
  selector: 'app-product-slider',
  standalone: true,
  imports: [CommonModule, CarouselModule, NgOptimizedImage],
  templateUrl: './product-slider.component.html',
  styleUrl: './product-slider.component.scss',
})
export class ProductSliderComponent implements AfterViewInit {
  sliderItems: IProductSliderImage[] = productSliderImages;

  @ViewChildren('slideContentRef', { read: ElementRef })
  slideContentRefs!: QueryList<ElementRef>;

  ngAfterViewInit(): void {
    this.setSlideContent();
  }

  setSlideContent() {
    this.sliderItems.forEach((item, idx) => {
      const slideContentRef = this.slideContentRefs.toArray()[idx];
      slideContentRef.nativeElement.innerHTML = item.author;
    });
  }
}
