# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Task | Command |
| --- | --- |
| Install deps | `npm install` |
| Dev server (http://localhost:4200) | `npm start` / `ng serve` |
| Production build (to `dist/`) | `npm run build` / `ng build` |
| Dev build in watch mode | `npm run watch` |
| Run all unit tests | `npm test` / `ng test` |
| Run a single spec | `ng test --include src/app/components/question/question.spec.ts` |

Tests run through the `@angular/build:unit-test` builder (configured in `angular.json`), which uses **Vitest** with a **jsdom** environment. There is no separate `vitest.config.ts`; test settings live in `angular.json` and `tsconfig.spec.json`. Vitest globals (`describe`/`it`/`expect`) are enabled via the `vitest/globals` types entry, so specs don't import them.

Formatting is Prettier (config in `package.json`): single quotes, `printWidth` 100, and the `angular` parser for `.html` templates.

## Architecture

Angular 21 single-page app. Supabase is named as the intended backend in the README but **no backend, auth, or data layer exists yet** — all survey lists render hard-coded placeholder components and `NewSurveyForm.onPublish()` is a stub.

### Angular conventions in this repo

- **Standalone components only** — no `NgModule`. Each component declares its own `imports` array.
- **New Angular naming style**: class names have no `Component` suffix and files have no `.component` segment (`app.ts` → `App`, `home.ts` → `Home`, `question.ts` → `Question`). Keep this pattern for new components.
- **Zoneless**: there is no `zone.js` dependency and no `polyfills` entry in `angular.json`. Do not rely on Zone-based change detection — use signals and `input()`/`output()`.
- Templates and styles are always separate files (`templateUrl` / `styleUrl`), SCSS, generated with `ng generate component`.
- TypeScript is in full strict mode plus `noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `noImplicitReturns`, and `strictTemplates`.

### Bootstrap and routing

`src/main.ts` → `bootstrapApplication(App, appConfig)`. `app.config.ts` provides the router (`provideRouter(routes)`) and global error listeners. `App` is a shell whose template is just `<router-outlet />`.

Routes (`src/app/app.routes.ts`) are **eagerly loaded**, not lazy:
- `''` → `Home`
- `'new-survey'` → `NewSurveyForm`

`Home` composes the page from components: `Header`, `Atf` (hero), `YourSurveys`, `ActiveSurveys`.

### Reactive-forms structure (the one non-trivial feature)

`NewSurveyForm` builds a nested reactive form entirely in the component class:

```
surveyForm: FormGroup
├── name, description, endDate: FormControl
└── questions: FormArray<FormGroup>
     └── each question: { text: FormControl, allowMultiple: FormControl, answers: FormArray<FormControl> }
```

- `createQuestion(required)` builds each question group; the first question is required, added questions (`addQuestion()`) are optional.
- The `Question` component is a **presentational child that receives its `FormGroup` via `questionGroup = input.required<FormGroup>()`** and mutates it directly (e.g. `addAnswer()` pushes to the nested `answers` FormArray). New form sub-sections should follow this "parent owns the form, child takes a `FormGroup` input" pattern.
- Answer labels (A, B, C…) are derived in `Question` from the control index via `String.fromCharCode(65 + index)`.

The two placeholder survey components are deliberately distinct: `active-surveys/survey` (`ActiveSurvey`, `<app-active-survey>`) and `your-surveys/survey` (`YourSurvey`, `<app-your-survey>`). Keep their selectors separate.

Both `tsconfig.app.json` and `tsconfig.spec.json` set `rootDir: ./src` explicitly to silence the TS 6.0 `TS6420` inference warning.
