import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentListShowComponent } from './content-list-show.component';

describe('ContentListShowComponent', () => {
  let component: ContentListShowComponent;
  let fixture: ComponentFixture<ContentListShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentListShowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentListShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
