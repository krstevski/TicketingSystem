import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelViewComponent } from './panel-view.component';

describe('PanelViewComponent', () => {
  let component: PanelViewComponent;
  let fixture: ComponentFixture<PanelViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
