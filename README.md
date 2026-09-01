# PadhaiPath

> **A calmer, clearer way to prepare.**

PadhaiPath is an elegant TypeScript study companion for students who want a practical plan, visible progress, and clear help when a difficult topic gets in the way. It combines a browser-local study planner with a secure server-side AI doubt solver.

## What it does

PadhaiPath helps a student create a focused preparation rhythm by collecting subjects, subject priorities, an exam date, and available study hours per day. It generates a balanced, day-wise schedule with learning, practice, and spaced-revision sessions. The personal dashboard surfaces the tasks for today, shows overall completion progress, and lets the student mark sessions complete.

The plan and completion state are saved in the browser using `localStorage`, so a refresh or a later visit on the same browser does not erase progress. The doubt solver sends questions to the TypeScript server through a typed tRPC procedure. The server calls the platform’s preconfigured language-model helper and returns a contextual answer with step-by-step reasoning. No model credential is placed in client-side code.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| UI | shadcn/ui primitives, Lucide icons, Fraunces + DM Sans typography |
| Backend | Node.js, Express, tRPC 11 |
| AI | Server-side `invokeLLM` helper provided by the project runtime |
| Persistence | Browser `localStorage` for plan and completion state |
| Validation | TypeScript compiler and Vitest |
| Project template | Manus full-stack web application with OAuth-ready server infrastructure |

## Run in GitHub Codespaces

### 1. Open the repository in a Codespace

Open the GitHub repository, select **Code**, choose the **Codespaces** tab, and create a new Codespace from the branch you want to run. The Codespace provides a Node.js development environment with the repository mounted as the working directory.

### 2. Install dependencies

Open the Codespaces terminal and run:

```bash
pnpm install
```

If `pnpm` is not available in a newly created environment, enable it with Corepack and then install dependencies:

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install
```

### 3. Start the development server

Run the full-stack development server:

```bash
pnpm dev
```

The server starts the Vite-powered React frontend and the Express/tRPC backend together. Codespaces should offer to forward the development port. Open the forwarded URL in a browser to use PadhaiPath.

The project intentionally uses the managed runtime’s port configuration rather than hardcoding a production port. For local development, the server normally appears on port `3000` in this template.

### 4. Optional: configure model access

The doubt solver uses the preconfigured server-side language-model integration. In the managed project environment, the required runtime credentials are injected on the server. Do not add model credentials to `client/`, `VITE_*` browser variables, or committed `.env` files.

If you run the repository outside the managed project environment, the UI and study planner still work locally, but the server-side AI request requires an equivalent server-only language-model configuration. Keep any replacement key in a server environment variable and adapt only the server integration layer.

## Common commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server with hot reload |
| `pnpm check` | Run the TypeScript compiler without emitting files |
| `pnpm test` | Run the Vitest suite once |
| `pnpm build` | Build the frontend and bundle the server for production |
| `pnpm start` | Start the production bundle after `pnpm build` |
| `pnpm format` | Format the project with Prettier |
| `pnpm db:push` | Generate and apply Drizzle migrations when database schema changes are introduced |

A recommended verification sequence is:

```bash
pnpm check
pnpm test
pnpm build
```

## How the application works

### Study-plan flow

1. The student enters subjects and assigns each one a priority.
2. The student selects an exam date and available study hours per day.
3. `generateStudyPlan()` sorts subjects by priority and distributes sessions across the available date range.
4. The generator alternates learning and practice sessions and inserts spaced-revision sessions at regular intervals.
5. The resulting plan is stored in React state and serialized to `localStorage`.
6. The dashboard calculates progress from completed sessions and renders the tasks for the current date.

### Doubt-solver flow

1. The student asks a question in the chat interface.
2. The client calls the typed `study.askDoubt` tRPC mutation.
3. The server validates the question with Zod.
4. The server sends the question and study context to `invokeLLM`.
5. The server returns only the generated answer to the client.
6. The client renders the answer as structured Markdown.

> The important security boundary is the server: the browser never receives the model credential and never calls the language-model provider directly.

## Project structure

```text
padhaipath/
├── client/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── studyStorage.ts       # localStorage persistence helpers
│   │   │   └── trpc.ts               # typed tRPC client
│   │   ├── pages/
│   │   │   └── Home.tsx              # setup, dashboard, and doubt solver UI
│   │   ├── App.tsx                   # application shell and routing
│   │   └── index.css                 # design tokens and global styles
├── server/
│   ├── routers.ts                    # auth and study.askDoubt procedures
│   ├── db.ts                         # database connection helpers
│   ├── studyPlan.test.ts             # generator and progress tests
│   ├── study.askDoubt.test.ts        # mocked server AI procedure tests
│   └── _core/                        # managed runtime infrastructure
├── shared/
│   └── studyPlan.ts                  # shared TypeScript contracts and generator
├── drizzle/                          # database schema and migrations
├── todo.md                            # implementation history and checklist
├── package.json
└── README.md
```

## Local persistence model

The active plan is stored under the browser key `padhaipath.active-plan.v1`. The saved JSON contains the exam date, available hours, subject priorities, generated sessions, and each session’s `completed` state. The app safely returns an empty state when there is no saved plan or when stored JSON is invalid.

Because this is browser-local persistence, data is specific to the browser profile and device. Clearing site data, using private browsing, or switching browsers can remove or hide the saved plan. A future cloud-sync feature would require an authenticated database model and a migration away from local-only state.

## Security notes

The client contains no AI API secret. The only client-to-server request is the typed `study.askDoubt` mutation, whose input is validated and length-limited on the server. The model prompt asks for approachable, step-by-step explanations and avoids pretending to know missing information. The AI response should support learning; students should still verify high-stakes academic, medical, legal, or safety-related information with a qualified source.

Do not commit `.env` files, API keys, session secrets, database URLs, or other credentials. Use the Codespaces secret store or the managed project’s server-side environment configuration for sensitive values.

## Testing

The test suite currently covers the schedule generator, progress calculation, localStorage round trips and invalid JSON handling, logout behavior from the scaffold, and successful or unavailable language-model responses through the doubt-solver procedure.

Run all tests with:

```bash
pnpm test
```

For a complete pre-commit check:

```bash
pnpm check && pnpm test && pnpm build
```

## Extending PadhaiPath

A good next extension is a calendar export that turns generated sessions into an `.ics` file. Other natural additions include editing a plan without losing completed sessions, weekly analytics, reminders, and optional authenticated cloud synchronization. Any database-backed feature should first update `drizzle/schema.ts`, generate and apply a migration, add typed server helpers and procedures, and then connect the UI through tRPC.

## License

This project is provided as an educational application starter. Add the license required by your repository or organization before public distribution.
