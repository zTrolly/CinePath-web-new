import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvShowDetailComponent } from './tv-show-detail.component';

describe('TvShowDetailComponent', () => {
  let component: TvShowDetailComponent;
  let fixture: ComponentFixture<TvShowDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TvShowDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TvShowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
