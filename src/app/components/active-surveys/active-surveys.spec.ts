import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveSurveys } from './active-surveys';

describe('ActiveSurveys', () => {
  let component: ActiveSurveys;
  let fixture: ComponentFixture<ActiveSurveys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveSurveys]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveSurveys);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
