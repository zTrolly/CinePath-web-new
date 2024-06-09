import { Component } from '@angular/core';
import { MovieResult, ShowResponse } from '../../types/request-types';
import { MovieDb } from '../../services/movieDb';
import { environment } from '../../../environments/environment';
import { AppService } from '../../services/appService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent {
  movieDb = new MovieDb(environment.api_key);
  favorites: (MovieResult | ShowResponse)[] = [];
  bookMarks: (MovieResult | ShowResponse)[] = [];
  whatchList: (MovieResult | ShowResponse)[] = [];


  userFavorites: { mediaType: string, mediaId: number }[] = [];
  userBookmarks: { mediaType: string, mediaId: number }[] = [];
  userWatchlist: { mediaType: string, mediaId: number }[] = [];

  idUsuario: string = '1';

  segment: string = 'Favoritos'; 

  constructor(private appService: AppService, private router: Router) {
   
  }

  ngOnInit(): void {
    this.subscribeToUser();
  }

  private subscribeToUser(): void {
    this.appService.user$.subscribe(user => {
      if (user) {
        this.idUsuario = user.uid;  // Atualiza o ID do usuário quando o usuário está logado
        console.log('User ID updated:', this.idUsuario);
        this.fetchFavorites();
        this.fetchBookmarks();
        this.fetchWatchlist();
      } else {
        this.idUsuario = 'Não autenticado';  // Definir como não autenticado ou similar
        console.log('No user logged in.');
      }
    });
  }

  navigateToContent(content: MovieResult | ShowResponse) {
    if ('title' in content) {
      this.router.navigate(['/contentDetail', 'movie', content.id]);
    } else if ('name' in content) {
      this.router.navigate(['/contentDetail', 'tvShow', content.id]);
    }
  }

  getImgUrl = (path?: string, size?: string) => `https://image.tmdb.org/t/p/w500${path}`;

  fetchFavorites = async () => {
    if (this.idUsuario !== 'Não autenticado') {
      this.userFavorites = await this.appService.getFavorites();
      console.log(this.userFavorites);
      this.favorites = await Promise.all(this.userFavorites.map(async favorite => {
        if (favorite.mediaType === 'movie') {
          return await this.movieDb.movieInfo({id: favorite.mediaId, language: 'pt-BR'});
        } else {
          return await this.movieDb.tvInfo({id: favorite.mediaId, language: 'pt-BR'});
        }
      }));
    }
  }

  fetchBookmarks = async () => {
    if (this.idUsuario !== 'Não autenticado') {
      this.userBookmarks = await this.appService.getBookmarks();
      console.log(this.userBookmarks);
      this.bookMarks = await Promise.all(this.userBookmarks.map(async bookmark => {
        if (bookmark.mediaType === 'movie') {
          return await this.movieDb.movieInfo({id: bookmark.mediaId, language: 'pt-BR'});
        } else {
          return await this.movieDb.tvInfo({id: bookmark.mediaId, language: 'pt-BR'});
        }
      }));
    }
  }

  fetchWatchlist = async () => {
    if (this.idUsuario !== 'Não autenticado') {
      this.userWatchlist = await this.appService.getWatchlist();
      console.log(this.userWatchlist);
      this.whatchList = await Promise.all(this.userWatchlist.map(async watchlist => {
        if (watchlist.mediaType === 'movie') {
          return await this.movieDb.movieInfo({id: watchlist.mediaId, language: 'pt-BR'});
        } else {
          return await this.movieDb.tvInfo({id: watchlist.mediaId, language: 'pt-BR'});
        }
      }));
    }
  }

  getTitle = (content: MovieResult | ShowResponse) => {
    if ('title' in content) {
      return content.title;
    } else if ('name' in content) {
      return content.name;
    } else {
      return '';
    }
  }


  onSegmentChange(): void {
    if (this.segment === 'Favoritos') {
      this.fetchFavorites();
    } else if (this.segment === 'Salvos') {
      this.fetchBookmarks();
    } else if (this.segment === 'Ver depois') {
      this.fetchWatchlist();
    }
  }

  fetchAll = async () => {
    await this.fetchFavorites();
    await this.fetchBookmarks();
    await this.fetchWatchlist();
  }

}
