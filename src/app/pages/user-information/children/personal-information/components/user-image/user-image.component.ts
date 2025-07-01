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
    this.changeImageEl.nativeElement.addEventListener('click', () =>
      this.changeImageInput.nativeElement.click()
    );
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    console.log('File selected:', file);
    if (file) {
      this.imageChanged.emit(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      input.value = '';
    }
  }
}
