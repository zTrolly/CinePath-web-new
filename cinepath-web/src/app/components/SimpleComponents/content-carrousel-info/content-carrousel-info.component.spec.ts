import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentCarrouselInfoComponent } from './content-carrousel-info.component';

describe('ContentCarrouselInfoComponent', () => {
  let component: ContentCarrouselInfoComponent;
  let fixture: ComponentFixture<ContentCarrouselInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentCarrouselInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentCarrouselInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
