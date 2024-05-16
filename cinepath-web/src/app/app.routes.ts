import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { MovieDetailComponent } from './pages/movie-detail/movie-detail.component';
import { TvShowDetailComponent } from './pages/tv-show-detail/tv-show-detail.component';
import { PersonDetailComponent } from './pages/person-detail/person-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'movie/:id', component: MovieDetailComponent },
  { path: 'tv-show/:id', component: TvShowDetailComponent },
  { path: 'person/:id', component: PersonDetailComponent }
];
