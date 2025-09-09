# PriceTracker

Full‑stack price tracking for electronics across multiple marketplaces. PriceTracker scrapes product listings (Amazon, Jumia, 2B), stores structured data and price history, and lets users explore trends, compare offers, and manage watchlists.

## Features
- **Multi‑platform aggregation**: Consolidates products and listings from Amazon, Jumia, and 2B.
- **Price history tracking**: Stores time‑series price points for trend analysis and charts.
- **Cross‑store comparison**: View best offers per product across platforms at a glance.
- **Watchlist management**: Save products to quickly monitor changes.
- **Modern UI**: Fast React + TypeScript frontend with Tailwind and component primitives.
- **Clean API + persistence**: ASP.NET Core Web API with EF Core and repository/unit‑of‑work patterns.
- **Scriptable scrapers**: Python scrapers and a lightweight ingestion service for automation.

## Tech stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: ASP.NET Core Web API, Entity Framework Core
- **Database**: EF Core migrations (SQL Server)
- **Scrapers**: Python (per‑site scrapers + ingestion service)

## How it works
1. **Scrapers (Python)** fetch listings and prices from target sites using site‑specific logic.
2. **Ingestion** posts normalized data to the **.NET API** (via `DataIngestion`/`Scraper` endpoints).
3. The **API** persists entities (`Product`, `Platform`, `Listing`, `PriceHistory`, `SecondHandListing`, `Watchlist`) via repositories and unit‑of‑work.
4. The **Frontend** consumes API endpoints to render product discovery, comparisons, price history, and user watchlists.

## Project structure
- `ElectronicsPriceTrackerBackEnd/`
  - `ElectronicsPriceTracker.API/`: Controllers (`Auth`, `Product`, `DataIngestion`, `Scraper`, `User`), configuration, bootstrap
  - `ElectronicsPriceTracker.Application/`: DTOs, service interfaces/implementations, AutoMapper profiles
  - `ElectronicsPriceTracker.Infrastructure/`: `AppDbContext`, EF migrations, repositories, unit‑of‑work
  - `ElectronicsPriceTracker.Domain/`: Core entity models
- `ElectronicsPriceTrackerFrontEnd/`
  - React app (`src/components`, contexts for `auth`, `cart`, `search`, `theme`), service worker, Vite config
- `Scrapers/`
  - Site scrapers (`amazon/`, `jumia/`, `twoB/`), `scraper-service.py`, request headers

## Configuration
Before running the backend, replace placeholders with your own values in `appsettings.Development.template.json`

```json
{
  "JwtSettings": {
    "Secret": "<YOUR_SECRET_HERE>",
    "Issuer": "ElectronicsPriceTracker",
    "Audience": "ElectronicsPriceTracker",
    "ExpiryInMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ScraperServiceUrl": "<YOUR_SCRAPER_URL>",
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "<YOUR_DB_CONNECTION>"
  }
}
```

## Getting started

### Backend (API)
- Set DB connection and JWT settings in `ElectronicsPriceTrackerBackEnd/ElectronicsPriceTracker.API/appsettings.Development.json`
- Apply migrations and run:
  - `dotnet restore`
  - `dotnet ef database update`
  - `dotnet run` in `ElectronicsPriceTrackerBackEnd/ElectronicsPriceTracker.API`

### Frontend (Web)
- In `ElectronicsPriceTrackerFrontEnd/`:
  - `npm install`
  - `npm run dev`

### Scrapers
- In the repo root:
  - `python -m venv .venv && source .venv/bin/activate`
  - `pip install -r requirements.txt`
  - Run `python Scrapers/scraper-service.py`

## Key endpoints (high level)
- `AuthController`: login/register, token issuance
- `ProductController`: product search, details, comparisons, history
- `DataIngestionController` / `ScraperController`: scraper → API ingestion
- `UserController`: profile and watchlist operations


## License
MIT 
