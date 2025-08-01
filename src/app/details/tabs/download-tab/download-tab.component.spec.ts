import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadTabComponent } from './download-tab.component';

describe('DownloadTabComponent', () => {
  let component: DownloadTabComponent;
  let fixture: ComponentFixture<DownloadTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
