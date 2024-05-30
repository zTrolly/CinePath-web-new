import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MovieDb } from '../../services/movieDb';
import { CreditsResponse, Person, PersonCombinedCreditsResponse, PersonMovieCreditsResponse } from '../../types/request-types';
import { CommonModule } from '@angular/common';
import { ContentCardComponent } from '../../components/SimpleComponents/content-card/content-card.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [CommonModule, ContentCardComponent],
  templateUrl: './person-detail.component.html',
  styleUrl: './person-detail.component.scss'
})
export class PersonDetailComponent implements OnInit{
  routeParams: any;
  id!: number
  movieDb = new MovieDb(environment.api_key);
  personInfo : Person | undefined;
  personCredits : PersonCombinedCreditsResponse | undefined;
  

  constructor(private route: ActivatedRoute) {}

  getImageUrl(path: string) {
    let pathNotFound = 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg';
    if (path) {
      return `https://image.tmdb.org/t/p/original/${path}`;
    }
    return pathNotFound;
  }

  getMediaType(mediaType: string) {
    switch(mediaType) {
      case 'movie':
        return 'movie';
      case 'tv':
        return 'tv-show';
      default:
        return 'Desconhecido';
    }
  }

  async getPersonInfo() {
    this.movieDb.personDetails({id: this.id, language: 'pt-BR'}).then(data => {
      this.personInfo = data;
    });
  }

  async getPersonCredits() {
    this.movieDb.personCredits({id: this.id, language: 'pt-BR'}).then(data => {
      this.personCredits = data;
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.routeParams = params;
      this.id = +this.routeParams.id;
      if (this.id) {
        this.getPersonInfo();
        this.getPersonCredits();
      }
    });
    
  }



}
