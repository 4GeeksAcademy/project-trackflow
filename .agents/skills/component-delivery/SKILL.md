# Skill: Component Delivery

## Objective
Deliver reusable UI or business logic components to the correct app or package, following TrackFlow monorepo rules.

## Inputs
- Component specification or user story
- Target app or package

## Steps
1. Review CONTEXT.md and memory-bank files for business and technical context
2. Review affected README files
3. Plan component delivery and document in memory-bank/progress.md
4. Implement component, importing shared logic as required
5. Validate build/lint for the target app

## Output
- Component delivered to the correct location, with imports (not copies) of shared logic

## Acceptance Criteria
- Component is reusable and follows monorepo import rules
- No business logic is duplicated
- Progress is documented in memory-bank/progress.md
- Build and lint pass for the target app
