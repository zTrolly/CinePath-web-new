import { Component, Input, OnInit } from '@angular/core';
import { MovieResult } from '../../../types/request-types';
import { MovieDb } from '../../../services/movieDb';
import { environment } from '../../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-content-carrousel-info',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './content-carrousel-info.component.html',
  styleUrl: './content-carrousel-info.component.scss'
})
export class ContentCarrouselInfoComponent implements OnInit{
  @Input() movie!: MovieResult;
  backdropImg: string = '';
  movieDb = new MovieDb(environment.api_key);
  parseToDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
  
  constructor() {
  }

  ngOnInit(): void {
    this.setBackdropImg();
  }

  async setBackdropImg() {
    if (this.movie.id) { // Add this condition to check if the id is defined
      const movieImages = await this.movieDb.movieImages(this.movie.id);
      console.log(movieImages);
      let backDrop = movieImages.backdrops?.filter((img) => {
        if (img.width && img.width === 1920) {
          return img;
        }
        return false; // Add this return statement to handle the case when the condition is not met
      });

      let poster = movieImages.posters?.filter((img) => {
        if (img.width && img.width === 500) {
          return img;
        }
        return false; // Add this return statement to handle the case when the condition is not met
      }
      );
      if (poster && poster.length > 0) {
        this.backdropImg = `https://image.tmdb.org/t/p/original${poster[0].file_path}`;
      } else{
        this.backdropImg = `https://image.tmdb.org/t/p/original${this.movie.poster_path}`;
      
      }
      if (backDrop && backDrop.length > 0) {
        this.backdropImg = `https://image.tmdb.org/t/p/original${backDrop[0].file_path}`;
      }
    }
  }
  




}
