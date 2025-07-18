import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureViewerComponent } from './structure-viewer.component';

describe('StructureViewerComponent', () => {
  let component: StructureViewerComponent;
  let fixture: ComponentFixture<StructureViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
