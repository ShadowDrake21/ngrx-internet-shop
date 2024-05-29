// angular stuff
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-video-section',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './video-section.component.html',
  styleUrls: ['./video-section.component.scss'],
})
export class VideoSectionComponent implements AfterViewInit {
  videoItem: { url: string; author: string; link: string } = {
    url: '/assets/images/videos/video-section.mp4',
    author: 'Polina Tankilevitch',
    link: 'https://www.pexels.com/video/browsing-an-online-store-5585939/',
  };

  playIcon = faPlayCircle;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('playButton') playButton!: ElementRef;

  ngAfterViewInit(): void {
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      const videoPlayer = this.videoPlayer.nativeElement as HTMLVideoElement;
      const playButton = this.playButton.nativeElement as HTMLButtonElement;

      videoPlayer.addEventListener('click', () =>
        this.togglePlayback(videoPlayer, playButton)
      );
      playButton.addEventListener('click', () =>
        this.togglePlayback(videoPlayer, playButton)
      );
    }
  }

  togglePlayback(videoPlayer: HTMLVideoElement, playButton: HTMLButtonElement) {
    if (videoPlayer.paused) {
      videoPlayer.play();
      playButton.classList.add('d-none');
    } else {
      videoPlayer.pause();
      playButton.classList.remove('d-none');
    }
  }
}
