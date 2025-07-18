import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculeDetailsComponent } from './molecule-details.component';

describe('MoleculeDetailsComponent', () => {
  let component: MoleculeDetailsComponent;
  let fixture: ComponentFixture<MoleculeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoleculeDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoleculeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
