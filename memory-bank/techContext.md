# Technical Context: TrackFlow

## Current Architecture
- Two separate warehouse management systems (one commercial, one spreadsheet)
- Manual carrier management (8 carriers, no unified tracking)
- Manual returns processing
- Customer queries handled by agents referencing a Google Drive document
- CEO receives weekly manual reports
- Integrations are undocumented and fragile

## Technical Constraints
- Need for unified inventory API
- Order ingestion pipeline required
- Operations dashboard needed
- Low-stock and carrier performance alerts
- Automation for repetitive customer queries
- Modern, maintainable, and scalable architecture

## Known Requirements
- All business logic must be imported, not copied, across apps
- Agents must review README files before creating folders
- Progress must be updated in memory-bank/progress.md before final commit
- Multilingual support is recommended
- Responsive, accessible, SEO-optimized public website
