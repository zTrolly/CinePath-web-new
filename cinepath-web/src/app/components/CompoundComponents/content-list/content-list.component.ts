import { Component, Input } from '@angular/core';
import { MovieResult } from '../../../types/request-types';
import { ContentCardComponent } from '../content-card/content-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [ContentCardComponent, CommonModule],
  templateUrl: './content-list.component.html',
  styleUrl: './content-list.component.scss'
})
export class ContentListComponent {
  @Input() list: MovieResult[] = [];
  @Input() title: string = '';
  getContentImg = (path: string) => `https://image.tmdb.org/t/p/original/${path}`;
  consoleContent = console.log('ContentListComponent');
  constructor() {}


}
