import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalReferenceComponent } from './external-reference.component';

describe('ExternalReferenceComponent', () => {
  let component: ExternalReferenceComponent;
  let fixture: ComponentFixture<ExternalReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalReferenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
