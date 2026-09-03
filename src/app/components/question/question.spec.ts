import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { Question } from './question';

function buildQuestionGroup(answerCount = 2): FormGroup {
  return new FormGroup({
    text: new FormControl(''),
    allowMultiple: new FormControl(false),
    answers: new FormArray(Array.from({ length: answerCount }, () => new FormControl(''))),
  });
}

describe('Question', () => {
  let component: Question;
  let fixture: ComponentFixture<Question>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Question],
    }).compileComponents();

    fixture = TestBed.createComponent(Question);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('questionGroup', buildQuestionGroup());
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clears the question text', () => {
    component.questionGroup().get('text')?.setValue('When?');
    component.clearText();

    expect(component.questionGroup().get('text')?.value).toBe('');
  });

  it('removes an answer down to a minimum of two', () => {
    fixture.componentRef.setInput('questionGroup', buildQuestionGroup(3));

    component.removeAnswer(0);
    expect(component.answers.length).toBe(2);

    component.removeAnswer(0);
    expect(component.answers.length).toBe(2);
  });

  it('emits remove when the header icon button is pressed', () => {
    let removed = 0;
    component.remove.subscribe(() => removed++);

    fixture.nativeElement.querySelector('.question-header app-delete-button button').click();

    expect(removed).toBe(1);
  });

  it('renders an icon button per answer row plus one for the question text', () => {
    const buttons = fixture.nativeElement.querySelectorAll('app-delete-button');
    // header + question text + 2 answers
    expect(buttons.length).toBe(4);
  });
});
