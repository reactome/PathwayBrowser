import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculeDownloadTableComponent } from './molecule-download-table.component';

describe('MoleculeDownloadTableComponent', () => {
  let component: MoleculeDownloadTableComponent;
  let fixture: ComponentFixture<MoleculeDownloadTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoleculeDownloadTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoleculeDownloadTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
