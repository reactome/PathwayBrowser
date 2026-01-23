import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyTermComponent } from './ontology-term.component';

describe('OntologyTermComponent', () => {
  let component: OntologyTermComponent;
  let fixture: ComponentFixture<OntologyTermComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OntologyTermComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OntologyTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
