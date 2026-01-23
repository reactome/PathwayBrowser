import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesComponent } from './species.component';

describe('SpeciesComponent', () => {
  let component: SpeciesComponent;
  let fixture: ComponentFixture<SpeciesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpeciesComponent]
    });
    fixture = TestBed.createComponent(SpeciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
