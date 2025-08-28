import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculeGroupComponent } from './molecule-group.component';

describe('MoleculeGroupComponent', () => {
  let component: MoleculeGroupComponent;
  let fixture: ComponentFixture<MoleculeGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoleculeGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoleculeGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
