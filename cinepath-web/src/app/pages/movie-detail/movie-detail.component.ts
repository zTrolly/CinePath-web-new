import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CreditsResponse, KeywordResponse, MovieKeywordResponse, MovieResponse, MovieReviewsResponse, VideosResponse } from '../../types/request-types';
import { MovieDb } from '../../services/movieDb';
import { environment } from '../../../environments/environment';
import { DatePipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { AppService } from '../../services/appService';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatTabsModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'], // Corrigido o nome da propriedade para "styleUrls"
  providers: [DatePipe]
})
export class MovieDetailComponent implements OnInit {
  routeParams: any;
  id!: number;
  backdropImg: string = '';

  movieInfo: MovieResponse | undefined;
  movieCredits: CreditsResponse | undefined;
  movieKeywords: MovieKeywordResponse | undefined;
  movieReviews: MovieReviewsResponse | undefined;
  videos: VideosResponse | undefined;
  videosUrls: SafeResourceUrl[] = [];
  MovieBackDrops: string[] = [];

  movieDb = new MovieDb(environment.api_key);

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router, private appService: AppService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.routeParams = params;
      this.id = +this.routeParams.id; // Convertendo para número
      if (this.id) {
        this.getMovieInfo();
        this.getMovieCredits();
        this.getMovieKeywords();
        this.getMovieVideos();
      }
    });
  }

  goToPersonDetail = (id: number) => {
    this.router.navigate(['/person', id]);
  }

  getMovieImg = (path: string): string => {  
    let pathNotFound = 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg';

    if (path) {
      return `https://image.tmdb.org/t/p/original/${path}`;
    }

    return pathNotFound;
  }

  async getMovieInfo() {
    try {
      this.movieInfo = await this.movieDb.movieInfo({ id: this.id, language: 'pt-BR' });
      this.setBackdropImg(); // Chamar setBackdropImg após obter movieInfo
    } catch (error) {
      console.error('Erro ao obter informações do filme:', error);
    }
  }

  async getMovieCredits() {
    try {
      this.movieCredits = await this.movieDb.movieCredits(this.id);
      console.log(this.movieCredits);
    } catch (error) {
      console.error('Erro ao obter créditos do filme:', error);
    }
  }

  async getMovieKeywords() {
    try {
      this.movieKeywords = await this.movieDb.movieKeywords(this.id);
      console.log(this.movieKeywords);
    } catch (error) {
      console.error('Erro ao obter palavras-chave do filme:', error);
    }
  }

  async setBackdropImg() {
    try {
      if (this.movieInfo) {
        const movieImages = await this.movieDb.movieImages(this.movieInfo.id!);
        this.MovieBackDrops = movieImages.backdrops?.map(img => `https://image.tmdb.org/t/p/original${img.file_path}`) || [];

        let backDrop = movieImages.backdrops?.filter(img => img.width === 1920);
        let poster = movieImages.posters?.filter(img => img.width === 500);

        if (poster && poster.length > 0) {
          this.backdropImg = `https://image.tmdb.org/t/p/original${poster[0].file_path}`;
        } else {
          this.backdropImg = `https://image.tmdb.org/t/p/original${this.movieInfo.poster_path}`;
        }

        if (backDrop && backDrop.length > 0) {
          this.backdropImg = `https://image.tmdb.org/t/p/original${backDrop[0].file_path}`;
        }
      }
    } catch (error) {
      console.error('Erro ao definir a imagem de fundo:', error);
    }
  }

  async getMovieVideos() {
    try {
      this.videos = await this.movieDb.movieVideos(this.id);
      this.getVideosUrls();
    } catch (error) {
      console.error('Erro ao obter vídeos do filme:', error);
    }
  }

  getVideosUrls() {
    if (this.videos && this.videos.results) {
      this.videosUrls = this.videos.results.map(video => this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${video.key}`));
    }
  }

  parseRuntime = (runtime: number): string => {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}min`;
  }

  getMovieDirector = () => {
    if (this.movieCredits && this.movieCredits.crew) {
      const director = this.movieCredits.crew.find(member => member.job === 'Director');
      return director ? director.name : '';
    }
    return '';
  }

  setFavorite = () => {
    this.appService.addFavorite('movie', this.id)
  }
}
