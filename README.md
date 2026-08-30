# PollApp

A survey/polling web application built with Angular 21. Users can browse active surveys, view their own surveys, and create new ones via a guided form.

> **Note:** This project is currently in development. Several features are not yet implemented (e.g. survey submission, backend integration, dynamic survey data).

## Tech Stack

- **Angular 21** with standalone components and reactive forms
- **Angular Router** for client-side navigation
- **Supabase** as the backend service (database, auth, API)
- **Vitest** for unit testing
- **TypeScript 5.9**

## Pages

| Route         | Component       | Description                                                     |
| ------------- | --------------- | --------------------------------------------------------------- |
| `/`           | `Home`          | Landing page with ATF section, active surveys, and your surveys |
| `/new-survey` | `NewSurveyForm` | Form to create and publish a new survey                         |

## Project Structure

```
src/app/
├── pages/
│   ├── home/               # Landing page
│   └── new-survey-form/    # Survey creation form
└── components/
    ├── header/             # App header
    ├── atf/                # Above-the-fold hero section
    ├── active-surveys/     # Browseable list of active/past surveys
    ├── your-surveys/       # User's own surveys (ending soon highlighted)
    └── question/           # Reusable question block within the survey form
```

## Features

- **Home page** with a hero section linking to survey creation
- **Active Surveys** tab with toggle between active and past surveys
- **Your Surveys** section highlighting surveys ending soon
- **New Survey Form** with:
  - Survey name, description, and optional end date
  - Dynamic question builder (add questions and answers)
  - Per-question "allow multiple answers" toggle
  - Character limits and required-field validation

## What's Not Yet Implemented

- Survey submission (`onPublish()` is a stub)
- Real survey data — lists currently render placeholder `<app-survey>` components
- Supabase integration (database, auth, API)
- User authentication

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
ng serve
```

Open `http://localhost:4200/` in your browser. The app reloads automatically on file changes.

## Building

```bash
ng build
```

Build artifacts are placed in `dist/`. Production builds are optimized by default.

## Running Unit Tests

```bash
ng test
```

Tests are run with [Vitest](https://vitest.dev/).

## Additional Resources

- [Angular CLI Overview](https://angular.dev/tools/cli)
- [Angular Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
