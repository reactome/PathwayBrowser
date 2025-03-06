import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossReferencesComponent } from './cross-references.component';

describe('CrossReferencesComponent', () => {
  let component: CrossReferencesComponent;
  let fixture: ComponentFixture<CrossReferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossReferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrossReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
