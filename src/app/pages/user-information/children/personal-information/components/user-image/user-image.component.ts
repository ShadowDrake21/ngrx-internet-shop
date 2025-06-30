import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'personal-information-user-image',
  imports: [],
  templateUrl: './user-image.component.html',
  styleUrl: './user-image.component.scss',
})
export class UserImageComponent implements AfterViewInit {
  @ViewChild('changeImageEl') changeImageEl!: ElementRef<HTMLDivElement>;
  @ViewChild('changeImageInput')
  changeImageInput!: ElementRef<HTMLInputElement>;

  @Input() imageUrl: string | null = null;
  @Output() imageChanged = new EventEmitter<File>();

  ngAfterViewInit(): void {
    this.changeImageEl.nativeElement.addEventListener('click', () => {
      this.changeImageInput.nativeElement.click();
    });
  }

  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageChanged.emit(file);
    }
  }
}
