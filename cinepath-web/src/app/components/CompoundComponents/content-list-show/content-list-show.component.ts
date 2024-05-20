import { Component, Input } from '@angular/core';
import { ContentCardComponent } from '../content-card/content-card.component';
import { CommonModule } from '@angular/common';
import { TvResult, TvResultsResponse } from '../../../types/request-types';

@Component({
  selector: 'app-content-list-show',
  standalone: true,
  imports: [ContentCardComponent, CommonModule],
  templateUrl: './content-list-show.component.html',
  styleUrl: './content-list-show.component.scss'
})
export class ContentListShowComponent {
  @Input() list: TvResult[] = [];
  @Input() title: string = '';
  getContentImg = (path: string) => `https://image.tmdb.org/t/p/original/${path}`;
  consoleContent = console.log('ContentListComponent');
  constructor() {}

}
