# MovieBox API Explorer

## Overview

This is a Next.js-based web application that provides an interactive API explorer and live website for the MovieBox API. The application allows users to search for movies, TV series, and music content, view trending items, access download links, stream content, and retrieve subtitles. It serves as both a documentation tool and a functional movie/TV series browsing platform.

The project bridges a Python-based MovieBox API library with a modern TypeScript/Next.js frontend, providing both an API testing interface (API Explorer) and a consumer-facing movie browsing experience with carousel support, search autocomplete, and full series support.

**Latest Updates (October 27, 2025)**:
- Fixed 403 errors in download/stream/subtitle APIs by using Python backend via secure execFile
- Added trending carousel to movies homepage using embla-carousel
- Implemented search autocomplete with real-time suggestions
- Created dynamic detail pages for movies and TV series with download/stream/subtitle support
- Full TV series support with season and episode selection
- Security improvements: Replaced command injection-vulnerable exec calls with secure execFile
- All APIs now properly integrated and working

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 16.0.0 with React Server Components (RSC) and App Router
- Uses TypeScript for type safety across all components and API routes
- Client-side rendering for interactive components (`"use client"` directive)
- Server-side API routes for backend communication

**UI Components**: Shadcn/ui component library built on Radix UI primitives
- Component library configured in `components.json` with "new-york" style
- Tailwind CSS for styling with custom CSS variables for theming (light/dark modes)
- Custom CSS uses OKLCH color space for better color management
- Lucide React for iconography

**State Management**: React hooks (useState, useEffect) for local component state
- No global state management library (Redux, Zustand, etc.) in use
- API calls made directly from components

**Page Structure**:
- `/` - API Explorer homepage with interactive testing tabs for all endpoints
- `/movies` - Live movie browsing interface with search and trending content
- `/movies/[detailPath]` - Dynamic movie/series detail pages

### Backend Architecture

**API Layer**: Next.js API Routes (App Router format in `app/api/`)
- RESTful API endpoints that proxy requests to the Python MovieBox library
- Endpoints include: search, trending, downloads, stream, subtitles, item-details, recommendations, popular-searches, search-suggestions, homepage, hot-movies-series

**Python Integration**: Child process execution for Python-based MovieBox API
- Python wrapper script (`scripts/moviebox_wrapper.py`) serves as bridge between Next.js and Python library
- Uses Node.js `child_process.execFile` with promisified async execution
- Python library location: `src/moviebox_api/` with core logic in `core.py`, `download.py`, `stream.py`, `requests.py`

**Python Library Architecture**:
- Session-based HTTP client using `httpx` for API requests
- Content extraction using both JSON parsing and HTML tag parsing (BeautifulSoup patterns visible)
- Pydantic models for data validation and type safety
- Async/await pattern throughout with sync wrappers available
- Supports multiple mirror hosts with fallback capability

**Error Handling**: 
- Try-catch blocks with specific error responses including creator attribution
- Python stderr captured and logged
- HTTP status codes (400, 500) used appropriately

### Data Flow

1. User interacts with Next.js frontend (API Explorer or Movies page)
2. Frontend makes fetch request to Next.js API route
3. API route either:
   - Calls Python wrapper script via `execFile` (for downloads, stream, subtitles)
   - Uses TypeScript MovieBox client directly (for search, trending, etc.)
4. Python script/TS client fetches data from MovieBox mirror hosts
5. Response formatted with creator attribution and returned to frontend
6. Frontend displays results in interactive UI components

### MovieBox API Client Design

**TypeScript Client** (`lib/moviebox-client.ts`):
- Replicates Python functionality in TypeScript
- Cookie management with global cookie store
- Configurable mirror host selection via environment variable `MOVIEBOX_API_HOST`
- Default headers including User-Agent, Referer, Accept-Language
- Subject type enumeration (ALL, MOVIES, TV_SERIES, MUSIC)

**Python Client** (`src/moviebox_api/`):
- Base classes: `BaseContentProvider`, `BaseFileDownloader` with ABC pattern
- Content providers: Homepage, Search, Trending, MovieDetails, TVSeriesDetails, etc.
- Sync and async method support (`get_content()` and `get_content_sync()`)
- Download capabilities with quality selection and progress tracking

## External Dependencies

### Third-Party Services

**MovieBox API Mirror Hosts**: Multiple mirror domains for redundancy
- Primary hosts: h5.aoneroom.com, movieboxapp.in, moviebox.pk, moviebox.ph, moviebox.id, v.moviebox.ph, netnaija.video
- Configurable via `MOVIEBOX_API_HOST` environment variable
- HTTPS protocol for all API communication

### NPM Packages

**Core Framework**:
- `next@16.0.0` - React framework with SSR/SSG capabilities
- `react` and `react-dom` - UI library
- `@vercel/analytics` - Analytics integration for Vercel deployment

**UI Component Libraries**:
- `@radix-ui/*` packages - Unstyled, accessible UI primitives (accordion, dialog, dropdown, select, tabs, etc.)
- `lucide-react` - Icon library
- `class-variance-authority` - Variant-based component styling
- `clsx` and `tailwind-merge` - CSS class name utilities

**Form & Validation**:
- `@hookform/resolvers` - Form validation resolvers
- `zod` (likely, given hookform resolvers) - Schema validation

**Date & Utilities**:
- `date-fns` - Date manipulation
- `embla-carousel-react` - Carousel component
- `cmdk` - Command menu component

**Styling**:
- `tailwindcss` - Utility-first CSS framework
- `autoprefixer` - CSS vendor prefixing
- `tw-animate-css` - Tailwind animation utilities

### Python Packages

**HTTP & Async**:
- `httpx` - Async HTTP client for API requests
- `asyncio` - Asynchronous programming support

**Data Validation & Parsing**:
- `pydantic` - Data validation using Python type hints
- BeautifulSoup (implied from tag extraction patterns) - HTML parsing

**Download Management**:
- `throttlebuster` - Custom download manager with chunking and resume support

**Testing**:
- `pytest` - Testing framework with asyncio support

### Deployment

**Platform**: Vercel
- Automatic deployments from repository
- Environment variables for configuration
- Analytics enabled via `@vercel/analytics`

**Development Server**: Custom port configuration
- Dev server runs on port 5000 with host 0.0.0.0 for network access