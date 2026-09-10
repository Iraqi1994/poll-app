import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ALL_SURVEYS, SURVEY_CATEGORIES, SurveyCategory } from '../../../models/survey';
import { CategoryFilter } from './category-filter';

describe('CategoryFilter', () => {
  let component: CategoryFilter;
  let fixture: ComponentFixture<CategoryFilter>;

  const trigger = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('.category-filter__trigger');
  const options = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.category-filter__option'));
  const caret = (): HTMLElement => fixture.nativeElement.querySelector('.category-filter__caret');

  const openPanel = async (): Promise<void> => {
    trigger().click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryFilter);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('selected', ALL_SURVEYS);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the panel with one option per category, "All Surveys" first', async () => {
    expect(options().length).toBe(0);

    await openPanel();

    expect(options().map((o) => o.textContent?.trim())).toEqual([...SURVEY_CATEGORIES]);
  });

  it('emits the picked category once and closes the panel', async () => {
    const picked: SurveyCategory[] = [];
    component.selectedChange.subscribe((category) => picked.push(category));

    await openPanel();
    options()[1].click();
    await fixture.whenStable();

    expect(picked).toEqual(['Team Activities']);
    expect(component.open()).toBe(false);
  });

  it('prompts while unfiltered and shows the pick once one is selected', async () => {
    expect(trigger().textContent?.trim()).toBe('Sort by categories');

    fixture.componentRef.setInput('selected', 'Health & Wellness');
    await fixture.whenStable();

    expect(trigger().textContent?.trim()).toBe('Health & Wellness');
  });

  it('marks only the selected category in the panel', async () => {
    fixture.componentRef.setInput('selected', 'Gaming & Entertainment');
    await openPanel();

    const selected = fixture.nativeElement.querySelectorAll('li[aria-selected="true"]');
    expect(selected.length).toBe(1);
    expect(selected[0].textContent?.trim()).toBe('Gaming & Entertainment');
  });

  it('closes on Escape and on an outside click, but not on an inside click', () => {
    component.open.set(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.open()).toBe(false);

    component.open.set(true);
    fixture.nativeElement
      .querySelector('.category-filter')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.open()).toBe(true);

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.open()).toBe(false);
  });

  it('flags the caret only while open', async () => {
    expect(caret().classList.contains('category-filter__caret--open')).toBe(false);

    await openPanel();

    expect(caret().classList.contains('category-filter__caret--open')).toBe(true);
  });
});
