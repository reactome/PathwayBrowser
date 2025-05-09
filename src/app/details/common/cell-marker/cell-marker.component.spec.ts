import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellMarkerComponent } from './cell-marker.component';

describe('CellMarkerComponent', () => {
  let component: CellMarkerComponent;
  let fixture: ComponentFixture<CellMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellMarkerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
