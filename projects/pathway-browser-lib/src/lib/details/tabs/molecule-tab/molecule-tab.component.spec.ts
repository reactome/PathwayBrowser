import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculeTabComponent } from './molecule-tab.component';

describe('MoleculeTabComponent', () => {
  let component: MoleculeTabComponent;
  let fixture: ComponentFixture<MoleculeTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoleculeTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoleculeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
