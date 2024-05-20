import { Component, Input } from "@angular/core";
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: "app-content-card",
  templateUrl: "./content-card.component.html",
  styleUrls: ["./content-card.component.scss"],
  imports: [MatIconModule],
  standalone: true,
})
export class ContentCardComponent {
  @Input() img!: string;
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() rating!: number;
  @Input() year!: string;
  @Input() onClick!: () => void;

  parseDate(date: string): string { 
    return new Date(date).getFullYear().toString();
  }

  constructor() {}
}
