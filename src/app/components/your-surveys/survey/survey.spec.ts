import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterLink, provideRouter } from '@angular/router';

import { YourSurvey } from './survey';

describe('YourSurvey', () => {
  let component: YourSurvey;
  let fixture: ComponentFixture<YourSurvey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YourSurvey],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(YourSurvey);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('survey', {
      id: 3,
      created_at: '2026-09-02T14:05:09Z',
      name: 'Favorite Programming Language 2026',
      description: 'Which language do you reach for first?',
      end_date: '2026-12-31',
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('links to its own survey', () => {
    const link = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);
    expect(TestBed.inject(Router).serializeUrl(link.urlTree!)).toBe('/survey/3');
  });

  it('shows the survey name', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Favorite Programming Language 2026',
    );
  });
});
