import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedDownloadFormComponent } from './animated-download-form.component';

describe('AnimatedDownloadFormComponent', () => {
  let component: AnimatedDownloadFormComponent;
  let fixture: ComponentFixture<AnimatedDownloadFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedDownloadFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimatedDownloadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
