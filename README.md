# PriceTracker

Full‑stack price tracking for electronics across multiple marketplaces. PriceTracker scrapes product listings (Amazon, Jumia, 2B), stores structured data and price history, and lets users explore trends, compare offers, and manage watchlists.

## 📺 Demo & Resources
<p align="left">
  <a href="https://www.youtube.com/watch?v=1p76e54SFeA">
    <img src="https://img.shields.io/badge/YouTube-Demo-red?logo=youtube&logoColor=white" alt="YouTube Demo">
  </a>
  <a href="https://www.popai.pro/ppt-share?shareKey=62cbfd671ab0d0ae2e3dd52445a9f90dcefb0094549b77851758f0a669aa7850&utm_source=presentationsharepage">
    <img src="https://img.shields.io/badge/Presentation-Slides-blue?logo=microsoftpowerpoint&logoColor=white" alt="Presentation Slides">
  </a>
  <a href="https://drive.google.com/file/d/1Mo60dsocuJ4l-FrVy7JVpOrpFTQLPd_i/view?usp=drive_link">
    <img src="https://img.shields.io/badge/Documentation-File-green?logo=googledrive&logoColor=white" alt="Documentation File">
  </a>
</p>


## 📸 Screenshots

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/3d288d79-e71d-495b-99b3-84b891233ce2" alt="Sign Up" width="300"/></td>
    <td><img src="https://github.com/user-attachments/assets/c0f6012c-5efb-431c-bdf5-c59870c6f644" alt="Login" width="300"/></td>
    <td><img src="https://github.com/user-attachments/assets/a66f910a-2a1e-464a-b080-86fcfb7398b8" alt="Forgot Password" width="300"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/863b8671-e21b-405c-b359-56ea22ab3f10" alt="About Us" width="300"/></td>
    <td><img src="https://github.com/user-attachments/assets/86bd5397-37fc-4654-bf83-ccb35b83ae05" alt="Home" width="300"/></td>
    <td><img src="https://github.com/user-attachments/assets/a99411ad-b383-4ae3-8bf3-e5b45765b2de" alt="Shop" width="300"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/8979c1ac-79e5-4ecd-8f8d-39a2edab042c" alt="Product Details" width="300"/></td>
    <td><img src="https://github.com/user-attachments/assets/32dfb241-bd07-4030-9aa2-511098e977cf" alt="Profile Settings" width="300"/></td>
    <td><img src="https://github.com/user-attachments/assets/ff2e2bcb-fe02-4e0b-9429-bc4ab8a31e63" alt="Contact Us" width="300"/></td>
  </tr>
</table>

---



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


