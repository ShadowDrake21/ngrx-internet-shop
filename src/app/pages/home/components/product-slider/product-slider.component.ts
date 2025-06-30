// angular stuff
import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { NgOptimizedImage } from '@angular/common';

// content
import { productSliderImages } from './content/product-slider.content';

@Component({
  selector: 'app-product-slider',
  imports: [CarouselModule, NgOptimizedImage],
  templateUrl: './product-slider.component.html',
  styleUrl: './product-slider.component.scss',
})
export class ProductSliderComponent implements AfterViewInit {
  readonly sliderItems = productSliderImages;

  @ViewChildren('slideContentRef', { read: ElementRef })
  private slideContentRefs!: QueryList<ElementRef<HTMLElement>>;

  ngAfterViewInit(): void {
    this.setSlideContent();
  }

  setSlideContent() {
    this.slideContentRefs.forEach(
      (sliderContentRef: ElementRef<HTMLElement>, index: number) => {
        if (index < this.sliderItems.length) {
          this.setSliderContent(
            sliderContentRef,
            this.sliderItems[index].author
          );
        }
      }
    );
  }

  private setSliderContent(
    elementRef: ElementRef<HTMLElement>,
    content: string
  ) {
    if (elementRef?.nativeElement) {
      elementRef.nativeElement.innerHTML = content;
    }
  }
}
