import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { YourSurveys } from './your-surveys';
import { FakeSupabase, provideFakeSupabase } from '../../testing/fake-supabase';
import { Supabase } from '../../services/supabase';
import { SurveyStore } from '../../services/survey-store';

describe('YourSurveys', () => {
  let component: YourSurveys;
  let fixture: ComponentFixture<YourSurveys>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [YourSurveys],
      providers: [provideRouter([]), provideFakeSupabase()],
    }).compileComponents();

    const db = TestBed.inject(Supabase) as unknown as FakeSupabase;
    db.surveys = [
      { id: 3, created_at: '', name: 'Later', description: null, end_date: '2099-12-31' },
      { id: 4, created_at: '', name: 'Open ended', description: null, end_date: null },
      { id: 5, created_at: '', name: 'Sooner', description: null, end_date: '2099-01-31' },
      { id: 6, created_at: '', name: 'Already over', description: null, end_date: '2020-01-01' },
    ];
    await TestBed.inject(SurveyStore).refresh();

    fixture = TestBed.createComponent(YourSurveys);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lists open surveys by nearest deadline, open-ended last', () => {
    expect(component.endingSoon().map((s) => s.name)).toEqual(['Sooner', 'Later', 'Open ended']);
  });
});
