import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ActiveSurveys } from './active-surveys';
import { FakeSupabase, provideFakeSupabase } from '../../testing/fake-supabase';
import { Supabase } from '../../services/supabase';
import { SurveyStore } from '../../services/survey-store';

describe('ActiveSurveys', () => {
  let component: ActiveSurveys;
  let fixture: ComponentFixture<ActiveSurveys>;

  const tabs = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.active-surveys__tab'));
  const cards = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('app-active-survey'));
  const shownIds = (): number[] => component.surveys().map((survey) => survey.id);

  /** Opens the category dropdown and clicks the option with the given label. */
  const pickCategory = async (label: string): Promise<void> => {
    fixture.nativeElement.querySelector('.category-filter__trigger').click();
    await fixture.whenStable();
    const options: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.category-filter__option'),
    );
    options.find((option) => option.textContent?.trim() === label)!.click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ActiveSurveys],
      providers: [provideRouter([]), provideFakeSupabase()],
    }).compileComponents();

    const db = TestBed.inject(Supabase) as unknown as FakeSupabase;
    db.surveys = [
      {
        id: 1,
        created_at: '',
        name: 'Open team',
        description: null,
        category: 'Team Activities',
        end_date: '2099-12-31',
      },
      {
        id: 2,
        created_at: '',
        name: 'Open health',
        description: null,
        category: 'Health & Wellness',
        end_date: '2099-12-31',
      },
      {
        id: 3,
        created_at: '',
        name: 'Open ended',
        description: null,
        category: 'Team Activities',
        end_date: null,
      },
      {
        id: 4,
        created_at: '',
        name: 'Past team',
        description: null,
        category: 'Team Activities',
        end_date: '2020-01-01',
      },
      {
        id: 5,
        created_at: '',
        name: 'Past uncategorised',
        description: null,
        category: null,
        end_date: '2020-01-01',
      },
      {
        id: 6,
        created_at: '',
        name: 'Open unknown category',
        description: null,
        category: 'Not A Real Category',
        end_date: '2099-12-31',
      },
    ];
    await TestBed.inject(SurveyStore).refresh();

    fixture = TestBed.createComponent(ActiveSurveys);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows still-open surveys by default, including open-ended ones', () => {
    expect(shownIds()).toEqual([1, 2, 3, 6]);
    expect(tabs()[0].getAttribute('aria-pressed')).toBe('true');
    expect(tabs()[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('shows only finished surveys on the past tab', async () => {
    tabs()[1].click();
    await fixture.whenStable();

    expect(shownIds()).toEqual([4, 5]);
    expect(tabs()[0].getAttribute('aria-pressed')).toBe('false');
    expect(tabs()[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('renders one card per survey left by the filters', async () => {
    expect(cards().length).toBe(4);

    tabs()[1].click();
    await fixture.whenStable();

    expect(cards().length).toBe(2);
  });

  it('narrows the current tab to the picked category', async () => {
    await pickCategory('Team Activities');

    expect(shownIds()).toEqual([1, 3]);
  });

  it('combines the tab and category filters', async () => {
    tabs()[1].click();
    await pickCategory('Team Activities');

    expect(shownIds()).toEqual([4]);
  });

  it('resets to the whole tab on "All Surveys" without changing the tab', async () => {
    await pickCategory('Team Activities');
    await pickCategory('All Surveys');

    expect(component.tab()).toBe('active');
    expect(shownIds()).toEqual([1, 2, 3, 6]);
  });

  it('surfaces null and unrecognised categories only under "All Surveys"', async () => {
    expect(shownIds()).toContain(6);

    await pickCategory('Technology & Innovation');

    expect(shownIds()).toEqual([]);
  });

  it('keeps the loading message tied to the store, not to an empty filter result', async () => {
    tabs()[1].click();
    await pickCategory('Technology & Innovation');

    expect(component.noData()).toBe(false);
    expect(fixture.nativeElement.querySelector('.active-surveys__status')).toBeNull();
    expect(fixture.nativeElement.querySelector('.active-surveys__empty')).not.toBeNull();
  });
});
