import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { videoItem } from './content/video-section.content';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-video-section',
  imports: [FontAwesomeModule],
  templateUrl: './video-section.component.html',
  styleUrls: ['./video-section.component.scss'],
})
export class VideoSectionComponent implements AfterViewInit {
  readonly videoItem = videoItem;
  readonly playIcon = faPlayCircle;
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('videoPlayer', { static: true })
  videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('playButton', { static: true })
  playButton!: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {
    this.setupVideoControls();
  }

  private setupVideoControls(): void {
    const videoElement = this.videoPlayer.nativeElement;
    const buttonElement = this.playButton.nativeElement;

    fromEvent(videoElement, 'click')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.togglePlayback(videoElement, buttonElement));

    fromEvent(buttonElement, 'click')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.togglePlayback(videoElement, buttonElement));

    fromEvent(videoElement, 'ended')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => buttonElement.classList.remove('d-none'));
  }

  private togglePlayback(
    videoPlayer: HTMLVideoElement,
    playButton: HTMLButtonElement
  ): void {
    if (videoPlayer.paused) {
      videoPlayer
        .play()
        .then(() => playButton.classList.add('d-none'))
        .catch((error) => console.error('Video playback failed:', error));
    } else {
      videoPlayer.pause();
      playButton.classList.remove('d-none');
    }
  }
}
