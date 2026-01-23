import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomInteractorDialogComponent } from './custom-interactor-dialog.component';

describe('CustomInteractorDialogComponent', () => {
  let component: CustomInteractorDialogComponent;
  let fixture: ComponentFixture<CustomInteractorDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomInteractorDialogComponent]
    });
    fixture = TestBed.createComponent(CustomInteractorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
