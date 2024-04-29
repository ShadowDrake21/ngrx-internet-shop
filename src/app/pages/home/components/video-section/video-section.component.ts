import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-video-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './video-section.component.html',
  styleUrls: ['./video-section.component.scss'],
})
export class VideoSectionComponent {
  videoItem: { url: string; author: string; link: string } = {
    url: '/assets/images/videos/video-section.mp4',
    author: 'Polina Tankilevitch',
    link: 'https://www.pexels.com/video/browsing-an-online-store-5585939/',
  };
}
