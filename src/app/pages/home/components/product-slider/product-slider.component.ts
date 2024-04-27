import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  IProductSliderImage,
  ProductSliderImages,
} from './content/product-slider.content';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-bootstrap/carousel';

@Component({
  selector: 'app-product-slider',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './product-slider.component.html',
  styleUrl: './product-slider.component.scss',
})
export class ProductSliderComponent implements AfterViewInit {
  sliderItems: IProductSliderImage[] = ProductSliderImages;

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
