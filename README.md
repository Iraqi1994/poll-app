# PollApp

A survey and polling web application built with Angular 21 and Supabase. Anyone can browse surveys, vote once per survey, watch the results update live, and publish new surveys through a guided form. No account is needed.

## Tech Stack

- **Angular 21**: standalone components, signals, zoneless change detection, reactive forms
- **Angular Router** for client-side navigation
- **Supabase** (Postgres and Realtime) as the backend
- **Vitest** with jsdom for unit tests
- **TypeDoc** for API documentation generated from the source
- **TypeScript 5.9**

## Features

- **Home page** with a hero section, an "ending soon" list, and a grid of all surveys
- **Active and past tabs** that split surveys by their end date, plus a **category filter**
- **Survey page** where you answer single-choice or multiple-choice questions and submit your vote
- **Live results** shown as percentages per answer, updated in real time as other people vote
- **One vote per survey** per voter, enforced locally and checked against the database
- **Closed surveys** that show results but no longer accept votes
- **New survey form** with:
  - Name, description, category and optional end date
  - Any number of questions, each with its own answers
  - A per-question "allow multiple answers" option
  - Validation with inline error messages, and a confirmation before redirecting home
- **Responsive layout** with a dedicated mobile layout for the form

## Pages

| Route         | Component       | Description                                                  |
| ------------- | --------------- | ------------------------------------------------------------ |
| `/`           | `Home`          | Hero, surveys ending soon, and all surveys with filters      |
| `/survey/:id` | `SurveyView`    | Answer a survey, or see its results if you voted or it ended |
| `/new-survey` | `NewSurveyForm` | Create and publish a new survey                              |

## Project Structure

```
src/app/
├── pages/          # Routed pages: home, survey-view, new-survey-form
├── components/     # Presentational and feature components
├── services/       # Supabase access, the shared store, voting and publishing
├── interfaces/     # Database row shapes and form drafts
├── models/         # View models and the list of survey categories
└── utils/          # Small helpers such as date checks
```

## How It Works

- **`Supabase`** wraps the client and exposes one method per query, plus Realtime subscriptions.
- **`SurveyStore`** owns all four datasets (surveys, questions, options, votes) as signals. It paints instantly from a `localStorage` snapshot, then revalidates from the network. Realtime events trigger a debounced refetch.
- **`Voting`** casts votes and remembers which surveys this browser voted in. It also asks the database, so a vote cast on another device counts too.
- **`Voter`** creates an anonymous id for the browser. It is stored in `localStorage` and is not a user account.
- **`Publishing`** writes a survey, its questions and its options in order, then refreshes the store.

Data lives in four Supabase tables: `surveys`, `questions`, `options` and `votes`.

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm start
```

Open `http://localhost:4200/`. The app reloads on file changes.

## Running Unit Tests

```bash
npm test
```

Tests run with [Vitest](https://vitest.dev/). To run a single spec:

```bash
ng test --include src/app/components/question/question.spec.ts
```

## Building

```bash
npm run build
```

The production build is written to `dist/poll-app/browser/`.

## Deployment

The app is static. Upload the contents of `dist/poll-app/browser/` to any static host.

- **Single-page fallback:** configure the server to return `index.html` for any path that is not a real file. Otherwise opening or refreshing `/survey/12` returns a 404. In nginx:

  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```

- **HTTPS:** required. The voter id uses `crypto.randomUUID()`, which only exists in secure contexts.
- **Base path:** the app expects to be served from the domain root. For a sub-path, build with `--base-href /your-path/`.

## Backend Configuration

The Supabase project URL and publishable key are set as constants in `src/app/services/supabase.ts`. The key is public by design, so access to the data is controlled by the Row Level Security policies on the tables. Review these before pointing the app at a different project.

## API Documentation

The methods and functions in `src` are documented with TSDoc. To generate a browsable site:

```bash
npm run docs
```

The output is written to `docs/`. Open `docs/index.html`. It is git-ignored, so regenerate it when needed.

## Known Limitations

- There is no authentication. Voting is anonymous and tied to a browser, so clearing site data lets someone vote again.
- The initial bundle is slightly over the configured 500 kB budget, which produces a build warning but does not stop the build.

## Additional Resources

- [Angular CLI Overview](https://angular.dev/tools/cli)
- [Angular Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- [Supabase Documentation](https://supabase.com/docs)
