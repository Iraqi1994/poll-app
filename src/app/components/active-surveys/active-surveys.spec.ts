import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ActiveSurveys } from './active-surveys';
import { provideFakeSupabase } from '../../testing/fake-supabase';

describe('ActiveSurveys', () => {
  let component: ActiveSurveys;
  let fixture: ComponentFixture<ActiveSurveys>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ActiveSurveys],
      providers: [provideRouter([]), provideFakeSupabase()],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveSurveys);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
