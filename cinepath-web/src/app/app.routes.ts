import { Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'search', loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent), ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'movie/:id', loadComponent: () => import('./pages/movie-detail/movie-detail.component').then(m => m.MovieDetailComponent), ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'tv-show/:id', loadComponent: () => import('./pages/tv-show-detail/tv-show-detail.component').then(m => m.TvShowDetailComponent), ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'person/:id', loadComponent: () => import('./pages/person-detail/person-detail.component').then(m => m.PersonDetailComponent), ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'favorites', loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent), ...canActivate(redirectUnauthorizedToLogin) },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
