import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareFormComponent } from './compare-form.component';

describe('CompareFormComponent', () => {
  let component: CompareFormComponent;
  let fixture: ComponentFixture<CompareFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
