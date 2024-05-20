import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieDb } from '../../services/movieDb';
import { environment } from '../../../environments/environment';
import { MovieNowPlayingResponse, MovieResponse, PopularMoviesResponse, ShowResponse, TopRatedMoviesResponse, TvResultsResponse, UpcomingMoviesResponse } from '../../types/request-types';
import { ContentCardComponent } from '../../components/CompoundComponents/content-card/content-card.component';

import { MatListModule} from '@angular/material/list';
import { ContentListComponent } from '../../components/CompoundComponents/content-list/content-list.component';
import { ContentListShowComponent } from '../../components/CompoundComponents/content-list-show/content-list-show.component';

type HomeComponentRenderType = 'movie' | 'tv' | 'animation';
const movieDb = new MovieDb(environment.api_key);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ContentCardComponent, MatListModule, ContentListComponent, ContentListShowComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  moviesPopular: PopularMoviesResponse | null = null;
  movieNowPlaying: MovieNowPlayingResponse | null = null;
  topRated: TopRatedMoviesResponse | null = null;
  upcomingMovies: UpcomingMoviesResponse | null = null;

  tvLatest: ShowResponse | null = null;
  tvPopular: TvResultsResponse | null = null;
  tvTopRated: TvResultsResponse | null = null;
  tvAiringToday: TvResultsResponse | null = null;



  getContentImg = (path: string) => `https://image.tmdb.org/t/p/w500${path}`;
  renderType: HomeComponentRenderType = 'movie';

  changeRenderType = async (type: HomeComponentRenderType) => {
    this.renderType = type;

    if (type === 'movie') {
      await this.fetchAllMovieData();
      console.log('Movie data fetched');
      this.cleanTvData();
    } else if (type === 'tv') {
      await this.fetchAllTvData();
      console.log('TV data fetched');
      this.cleanMovieData();
    } else {
      this.cleanMovieData();
      this.cleanTvData();
    }
  }

  
  fetchAllMovieData = async () => {
    try {
      this.moviesPopular = await movieDb.moviePopular();
      this.movieNowPlaying = await movieDb.movieNowPlaying();
      this.topRated = await movieDb.movieTopRated();
      this.upcomingMovies = await movieDb.upcomingMovies({ region: 'BR' });

      if (this.moviesPopular) {
        this.moviesPopular.results = this.moviesPopular.results?.filter((movie) => movie.poster_path);
      }

      if (this.movieNowPlaying) {
        this.movieNowPlaying.results = this.movieNowPlaying.results?.filter((movie) => movie.poster_path);
      }

      if (this.upcomingMovies) {
        this.upcomingMovies.results = this.upcomingMovies.results?.filter((movie) => movie.poster_path);
      }
      

    
    } catch (error) {
      console.error('Error fetching movie data', error);
    }
  }

  cleanMovieData = () => {
    this.moviesPopular = null;
    this.movieNowPlaying = null;
    this.topRated = null;
    this.upcomingMovies = null;
  }

  fetchAllTvData = async () => {
    try {
      this.tvLatest = await movieDb.tvLatest();
      this.tvPopular = await movieDb.tvPopular();
      this.tvTopRated = await movieDb.tvTopRated();
      this.tvAiringToday = await movieDb.tvAiringToday();
    } catch (error) {
      console.error('Error fetching TV data', error);
    }
  }

  cleanTvData = () => {
    this.tvLatest = null;
    this.tvPopular = null;
    this.tvTopRated = null;
    this.tvAiringToday = null;
  }
console: any;

  constructor() { }

  async ngOnInit() {
    await this.fetchAllMovieData();
    console.log(this.moviesPopular);
  }
}
