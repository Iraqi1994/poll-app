import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { SURVEY_CATEGORIES, SurveyCategory } from '../../models/survey';
import { CategorySelect } from './category-select';

describe('CategorySelect', () => {
  let component: CategorySelect;
  let fixture: ComponentFixture<CategorySelect>;
  let control: FormControl<SurveyCategory | ''>;

  const trigger = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('.category-select__trigger');
  const options = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.category-select__option'));
  const selectedRow = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.category-select__selected');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorySelect],
    }).compileComponents();

    control = new FormControl<SurveyCategory | ''>('', { nonNullable: true });
    fixture = TestBed.createComponent(CategorySelect);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categoryControl', control);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps the trigger label as "Choose category" before and after a selection', async () => {
    expect(trigger().textContent?.trim()).toBe('Choose category');

    trigger().click();
    await fixture.whenStable();
    options()[1].click();
    await fixture.whenStable();

    expect(trigger().textContent?.trim()).toBe('Choose category');
  });

  it('opens the panel with one option per category on trigger click', async () => {
    expect(options().length).toBe(0);

    trigger().click();
    await fixture.whenStable();

    expect(options().length).toBe(SURVEY_CATEGORIES.length);
    expect(options().some((o) => o.textContent?.trim() === 'All Surveys')).toBe(true);
  });

  it('writes the picked value into the control and closes on option click', async () => {
    trigger().click();
    await fixture.whenStable();
    options()[1].click();
    await fixture.whenStable();

    expect(control.value).toBe('Team Activities');
    expect(control.touched).toBe(true);
    expect(component.open()).toBe(false);
  });

  it('shows the selection with a clear button that resets the control', async () => {
    trigger().click();
    await fixture.whenStable();
    options()[2].click();
    await fixture.whenStable();
    expect(selectedRow()?.textContent).toContain('Health & Wellness');

    fixture.nativeElement
      .querySelector('.category-select__selected app-delete-button button')
      .click();
    await fixture.whenStable();

    expect(control.value).toBe('');
    expect(selectedRow()).toBeNull();
  });

  it('reflects a value set on the control into the selected display', () => {
    control.setValue('Gaming & Entertainment');
    // The control is plain (not signal-backed), so an external write needs an explicit refresh.
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(component.value).toBe('Gaming & Entertainment');
    expect(selectedRow()?.textContent).toContain('Gaming & Entertainment');
  });

  it('closes on Escape and on an outside click, but not on an inside click', () => {
    component.open.set(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.open()).toBe(false);

    component.open.set(true);
    fixture.nativeElement
      .querySelector('.category-select')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.open()).toBe(true);

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.open()).toBe(false);
  });

  it('does not open while the control is disabled', () => {
    control.disable();
    component.toggle();

    expect(component.open()).toBe(false);
  });

  it('flags the caret only while open', async () => {
    const caret = (): HTMLElement => fixture.nativeElement.querySelector('.category-select__caret');
    expect(caret().classList.contains('category-select__caret--open')).toBe(false);

    trigger().click();
    await fixture.whenStable();

    expect(caret().classList.contains('category-select__caret--open')).toBe(true);
  });
});
