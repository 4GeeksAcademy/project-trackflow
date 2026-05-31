# Rule: Monorepo Architecture

## Scope
This rule applies to all contributors and agents working within the TrackFlow monorepo.

## Rule
- All business logic and shared types must be imported from their original source; duplication is not allowed.
- New folders or packages must be justified and documented in the relevant README before creation.
- All changes must be reflected in memory-bank/progress.md.
- Each app must have its own build and lint scripts if not managed by a root workspace runner.
