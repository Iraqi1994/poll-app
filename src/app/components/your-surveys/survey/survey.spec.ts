import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { YourSurvey } from './survey';

describe('YourSurvey', () => {
  let component: YourSurvey;
  let fixture: ComponentFixture<YourSurvey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YourSurvey],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YourSurvey);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
