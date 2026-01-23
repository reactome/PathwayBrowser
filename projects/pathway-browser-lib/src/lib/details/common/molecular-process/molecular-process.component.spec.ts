import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MolecularProcessComponent } from './molecular-process.component';

describe('GenericObjectComponent', () => {
  let component: MolecularProcessComponent;
  let fixture: ComponentFixture<MolecularProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MolecularProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MolecularProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
