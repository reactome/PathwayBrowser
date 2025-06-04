import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionTabComponent } from './description-tab.component';

describe('DetailsComponent', () => {
  let component: DescriptionTabComponent;
  let fixture: ComponentFixture<DescriptionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescriptionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
