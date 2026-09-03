import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteButton } from './delete-button';

describe('DeleteButton', () => {
  let component: DeleteButton;
  let fixture: ComponentFixture<DeleteButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteButton],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteButton);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Clear field');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a non-submit button with the label as aria-label', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Clear field');
  });

  it('renders a decorative glyph', () => {
    const glyph: HTMLElement = fixture.nativeElement.querySelector('.delete-button__glyph');
    expect(glyph).not.toBeNull();
    expect(glyph.getAttribute('aria-hidden')).toBe('true');
  });

  it('emits pressed once per click', () => {
    let count = 0;
    component.pressed.subscribe(() => count++);

    fixture.nativeElement.querySelector('button').click();

    expect(count).toBe(1);
  });
});
