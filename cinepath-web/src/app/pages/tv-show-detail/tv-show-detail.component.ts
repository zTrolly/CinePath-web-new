import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieDb } from '../../services/movieDb';
import { environment } from '../../../environments/environment';
import { DatePipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CreditsResponse, ShowResponse, TvKeywordsResponse, TvReviewsResponse, VideosResponse } from '../../types/request-types';

import { AppService } from '../../services/appService';

@Component({
  selector: 'app-tv-show-detail',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatTabsModule],
  templateUrl: './tv-show-detail.component.html',
  styleUrl: './tv-show-detail.component.scss',
  providers: [DatePipe]

})

export class TvShowDetailComponent implements OnInit{
  routeParams: any;
  id!: number;
  backdropImg: string = '';
  movieDb = new MovieDb(environment.api_key);

  showInfo: ShowResponse | undefined;
  showCredits: CreditsResponse | undefined;
  showKeywords: TvKeywordsResponse| undefined;
  showReviews: TvReviewsResponse | undefined;
  videos: VideosResponse | undefined;
  videosUrls: SafeResourceUrl[] = [];
  ShowBackDrops: string[] = [];

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private appService: AppService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.routeParams = params;
      this.id = +this.routeParams.id; // Convertendo para número
      if (this.id) {
        this.getShowInfo();
        this.getShowCredits();
        this.getShowKeywords();
        this.getShowVideos();
      }
    });
  }


  getShowImg = (path: string): string => {  
    let pathNotFound = 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg';

    if (path) {
      return `https://image.tmdb.org/t/p/original/${path}`;
    }

    return pathNotFound;
  }

  async getShowInfo() {
    try {
      this.showInfo = await this.movieDb.tvInfo({id: this.id, language: 'pt-BR'});
      this.setBackdropImg();
     
    } catch (error) {
      console.error(error);
    }
  }

  async getShowCredits() {
    try {
      this.showCredits = await this.movieDb.tvCredits(this.id);
     
    } catch (error) {
      console.error(error);
    }
  }

  async getShowKeywords() {
    try {
      this.showKeywords = await this.movieDb.tvKeywords(this.id);
     
    } catch (error) {
      console.error(error);
    }
  }

  async setBackdropImg() {
    try{
      if(this.showInfo){
        const showImages = await this.movieDb.tvImages(this.id);
        this.ShowBackDrops = showImages.backdrops?.map(img => `https://image.tmdb.org/t/p/original${img.file_path}`) || [];
    
        let backDrop = showImages.backdrops?.filter(img => img.width === 1920);
        let poster = showImages.posters?.filter(img => img.width === 500);
    
        if (poster && poster.length > 0) {
          this.backdropImg = `https://image.tmdb.org/t/p/original${poster[0].file_path}`;
        } else {
          this.backdropImg = `https://image.tmdb.org/t/p/original${this.showInfo.poster_path}`;
        }
    
        if (backDrop && backDrop.length > 0) {
          this.backdropImg = `https://image.tmdb.org/t/p/original${backDrop[0].file_path}`;
        }      }
    }catch(error){
      console.error(error);
    }

  }

  async getShowVideos() {
    try {
      this.videos = await this.movieDb.tvVideos(this.id);
      this.getVideosUrls();
    } catch (error) {
      console.error(error);
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

  getShowDirector = (): string => {
    if (this.showCredits && this.showCredits.crew) {
      return this.showCredits.crew.find(crew => crew.job === 'Director')?.name || '';
    }
    return '';
  }

  setFavorite = () => {
    this.appService.addFavorite('tv-show', this.id)
  }
}
