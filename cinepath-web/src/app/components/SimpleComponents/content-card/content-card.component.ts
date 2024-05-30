import { Component, Input } from "@angular/core";
import {MatIconModule} from '@angular/material/icon';
import { Router } from "@angular/router";

@Component({
  selector: "app-content-card",
  templateUrl: "./content-card.component.html",
  styleUrls: ["./content-card.component.scss"],
  imports: [MatIconModule],
  standalone: true,
})
export class ContentCardComponent {
  @Input() img!: string;
  @Input() id!: number;
  @Input() type!: string;
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() rating!: number;
  @Input() year!: string;
  @Input() onClick!: () => void;
  navigateToDetail: void | undefined

  parseDate(date: string): string { 
    return new Date(date).getFullYear().toString();
  }

  constructor(private router: Router) {}
  navigateToDetailPage = () => this.router.navigate([`/${this.type}`, this.id]);
    
}
