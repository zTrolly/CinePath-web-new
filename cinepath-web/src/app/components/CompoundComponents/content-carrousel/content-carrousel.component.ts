import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ContentCarrouselInfoComponent } from '../../SimpleComponents/content-carrousel-info/content-carrousel-info.component';
import { MovieResult } from '../../../types/request-types';


@Component({
  selector: 'app-content-carrousel',
  standalone: true,
  templateUrl: './content-carrousel.component.html',
  styleUrl: './content-carrousel.component.scss',
  providers: [NgbCarouselConfig],
  imports: [NgbCarouselModule, CommonModule, ContentCarrouselInfoComponent]
})
export class ContentCarrouselComponent {

  @Input() movies: MovieResult[] = [];

	images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);

  constructor(config: NgbCarouselConfig) {
    // customize default values of carousels used by this component tree
    config.interval = 10000;
    config.wrap = false;
    config.keyboard = false;
    config.pauseOnHover = false;
  }

}
