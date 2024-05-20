import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentCarrouselComponent } from './content-carrousel.component';

describe('ContentCarrouselComponent', () => {
  let component: ContentCarrouselComponent;
  let fixture: ComponentFixture<ContentCarrouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentCarrouselComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentCarrouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
