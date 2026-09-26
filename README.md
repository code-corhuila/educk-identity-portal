# educk-identity-portal

Identity web remote for EduTrack. HU-003 provides the institutional login, an authenticated profile with role context, friendly credential errors and logout.

## Local development

Requires Node 22 LTS or 24.

```bash
npm install
npm test
npm run dev
```

The portal runs on `http://localhost:3001`. This slice uses a simulated identity response shaped like `identity-service.yaml`; HTTP integration remains outside this change. Access credentials remain in memory and are never rendered.

## Branching

Changes enter `develop` through `feat/`, `fix/` or `chore/` Pull Requests. Permanent branches are never updated directly.
