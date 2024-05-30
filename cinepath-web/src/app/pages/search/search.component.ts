import { Component, OnInit } from '@angular/core';
import { MovieDb } from '../../services/movieDb';
import { environment } from '../../../environments/environment';
import { MovieResult, PersonResult, SearchMultiResponse, TvResult } from '../../types/request-types';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ContentCardComponent } from '../../components/SimpleComponents/content-card/content-card.component';



@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ CommonModule, FormsModule, HttpClientModule, RouterLink, ContentCardComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  movieDb = new MovieDb(environment.api_key);
  multiSearchResult : SearchMultiResponse | null = null;
  movieResult: MovieResult[] = [];
  tvShowResult: TvResult[] = [];
  personResult: PersonResult[] = [];

  searchQuery: string = '';

  ngOnInit() {
    this.search();
  }

  search = async () => {
    if (this.searchQuery) {
      this.multiSearchResult = await this.movieDb.searchMulti({query: this.searchQuery, include_adult: false, region: 'EN', language: 'pt-BR'});
      if (this.multiSearchResult.results) {
        this.movieResult = this.multiSearchResult.results.filter((result) => result.media_type === 'movie') as MovieResult[];
        this.tvShowResult = this.multiSearchResult.results.filter((result) => result.media_type === 'tv') as TvResult[];
        this.personResult = this.multiSearchResult.results.filter((result) => result.media_type === 'person') as PersonResult[];
      }
    }
  }










  constructor() {}


}
