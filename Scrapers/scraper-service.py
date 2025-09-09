import logging
from fastapi import FastAPI
import os
import time
import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from twoB.twoB_scraper import scrape_2b_categories
from jumia import jumia_scraper
from amazon import amazon_scraper
from concurrent.futures import ThreadPoolExecutor
from typing import Dict

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
app = FastAPI()

ASP_NET_INGEST_URL = os.getenv(
    "ASPNET_INGEST_URL", "http://localhost:5000/api/DataIngestion/ingest"
)

twoB_CATEGORY_URLS: Dict[str, Dict[str, str]] = {
    "laptops": {
        "url_template": "https://2b.com.eg/en/computers/laptops.html?p={}&product_list_limit=48"
    },
    "tvs": {
        "url_template": "https://2b.com.eg/en/televisions/tvs.html?p={}&product_list_limit=48"
    },
    "phones": {
        "url_template": "https://2b.com.eg/en/mobile-and-tablet/mobiles.html?p={}&product_list_limit=48"
    },
    # "storage": {
    #     "url_template": "https://2b.com.eg/en/computers/storage.html?p={}&product_list_limit=48"
    # },
}


PRESENTATION_CATEGORIES: Dict[str, Dict[str, str]] = {
    "phones": {
        "url_template": "https://2b.com.eg/en/mobile-and-tablet/mobiles.html?p={}&product_list_limit=48"
    },
    "tvs": {
        "url_template": "https://2b.com.eg/en/televisions/tvs.html?p={}&product_list_limit=48"
    },
    "laptops": {
        "url_template": "https://2b.com.eg/en/computers/laptops.html?p={}&product_list_limit=48"
    },
}

scraper_statuses = {"amazon": "idle", "2b": "idle", "jumia": "idle"}
active_scrapes = {"amazon": False, "2b": False, "jumia": False}


executor = ThreadPoolExecutor(max_workers=3)

AMAZON_HEADERS_PATH = os.path.join(os.path.dirname(__file__), "amazon", "headers.json")
if not os.path.exists(AMAZON_HEADERS_PATH):
    AMAZON_HEADERS_PATH = os.path.join(os.path.dirname(__file__), "headers.json")

amazon_headers = amazon_scraper.load_headers(AMAZON_HEADERS_PATH)
AMAZON_DEFAULT_CATEGORIES = [
    {"n%3A21832907031": "laptops"},
    {"n%3A21832982031": "tvs"},
    {"n%3A21832958031": "smart_watches"},
    {"n%3A21833212031": "cpu"},
    {"n%3A21832883031": "phones"},
    {"n%3A21833215031": "gpus"},
    {"n%3A21832907031": "laptops"},
    # {"n%3A21832887031": "headphones"},
]


def send_data_to_backend(products_data: list, scraper_name: str):
    if not products_data:
        logging.info(f"No data from {scraper_name} to send to backend.")
        return

    payload = []
    for item in products_data:
        payload_item = {
            "ProductTitle": item.get("product_title"),
            "ProductPrice": item.get("product_price") or item.get("price"),
            "ProductUrl": item.get("product_url"),
            "ProductImageUrl": item.get("product_image_url"),
            "ProductImageLocalPath": item.get("product_image_local_path"),
            "PlatformName": item.get("platform"),
            "CategoryName": item.get("category"),
        }
        if (
            payload_item["ProductTitle"]
            and payload_item["ProductUrl"]
            and payload_item["PlatformName"]
        ):
            payload.append(payload_item)
        else:
            logging.warning(
                f"Skipping item due to missing essential fields: {item.get('product_title')}"
            )

    if not payload:
        logging.info(
            f"No valid data from {scraper_name} to send to backend after filtering."
        )
        return

    try:
        logging.info(
            f"Sending {len(payload)} products from {scraper_name} to {ASP_NET_INGEST_URL}"
        )
        response = requests.post(
            ASP_NET_INGEST_URL, json=payload, timeout=6000, verify=False
        )
        response.raise_for_status()
        logging.info(
            f"Successfully sent data from {scraper_name} to ASP.NET. Response: {response.text}"
        )
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to send data from {scraper_name} to ASP.NET: {e}")
        if hasattr(e, "response") and e.response is not None:
            logging.error(f"Response content: {e.response.text}")
    except Exception as ex:
        logging.error(
            f"An unexpected error occurred while sending data from {scraper_name}: {ex}"
        )


def run_amazon_scrape_job():
    if active_scrapes["amazon"]:
        logging.info("Amazon scrape already running.")
        return
    active_scrapes["amazon"] = True
    scraper_statuses["amazon"] = "running"
    try:
        logging.info("Starting Amazon scraping job...")
        scraped_data = amazon_scraper.scrape_categories(
            categories=AMAZON_DEFAULT_CATEGORIES,
            headers=amazon_headers,
            db_path=None,
            image_dir=os.path.join(os.path.dirname(__file__), "amazon", "images"),
            max_retries=50,
            retry_delay=1,
        )
        logging.info(f"Amazon scraping finished. Products found: {len(scraped_data)}")
        send_data_to_backend(scraped_data, "Amazon")
        scraper_statuses["amazon"] = "completed"
    except Exception as e:
        logging.error(f"Amazon scraping failed: {e}")
        scraper_statuses["amazon"] = "failed"
    finally:
        time.sleep(5)
        scraper_statuses["amazon"] = "idle"
        active_scrapes["amazon"] = False


def run_2b_scrape_job():
    source_category_definitions = twoB_CATEGORY_URLS
    if os.getenv("PRESENTATION_MODE", "false").lower() == "true":
        logging.info("2B: Presentation mode enabled. Using presentation categories.")
        source_category_definitions = PRESENTATION_CATEGORIES
    else:
        logging.info("2B: Using default categories.")

    category_url_templates_to_scrape: Dict[str, str] = {
        cat_name: details["url_template"]
        for cat_name, details in source_category_definitions.items()
    }

    if not category_url_templates_to_scrape:
        logging.info("No 2B categories configured to scrape.")
        scraper_statuses["2b"] = "idle"
        active_scrapes["2b"] = False
        return

    if active_scrapes["2b"]:
        logging.info("2B scrape already running.")
        return
    active_scrapes["2b"] = True
    scraper_statuses["2b"] = "running"
    try:
        logging.info(
            f"Starting 2B scraping job for categories: {list(category_url_templates_to_scrape.keys())}"
        )

        scraped_data = scrape_2b_categories(
            category_url_templates=category_url_templates_to_scrape,
            image_dir=os.path.join(os.path.dirname(__file__), "twoB", "images"),
        )

        logging.info(f"2B scraping finished. Products found: {len(scraped_data)}")
        send_data_to_backend(scraped_data, "2B")
        scraper_statuses["2b"] = "completed"
    except Exception as e:
        logging.error(f"2B scraping failed: {e}")
        scraper_statuses["2b"] = "failed"
    finally:
        time.sleep(5)
        scraper_statuses["2b"] = "idle"
        active_scrapes["2b"] = False


def run_jumia_scrape_job():
    if active_scrapes["jumia"]:
        logging.info("Jumia scrape already running.")
        return
    active_scrapes["jumia"] = True
    scraper_statuses["jumia"] = "running"
    try:
        logging.info("Starting Jumia scraping job...")
        scraper = jumia_scraper.JumiaScraper(
            image_dir=os.path.join(os.path.dirname(__file__), "jumia", "images")
        )
        scraped_data = scraper.scrape_all()
        logging.info(f"Jumia scraping finished. Products found: {len(scraped_data)}")
        send_data_to_backend(scraped_data, "Jumia")
        scraper_statuses["jumia"] = "completed"
    except Exception as e:
        logging.error(f"Jumia scraping failed: {e}")
        scraper_statuses["jumia"] = "failed"
    finally:
        time.sleep(5)
        scraper_statuses["jumia"] = "idle"
        active_scrapes["jumia"] = False


@app.post("/scrape/amazon")
async def trigger_amazon_scrape_endpoint():
    logging.info("Received Amazon scrape request via endpoint")
    if active_scrapes["amazon"]:
        return {"message": "Amazon scraping is already running."}
    executor.submit(run_amazon_scrape_job)
    return {"message": "Amazon scraping started in background."}


@app.post("/scrape/2b")
async def trigger_2b_scrape_endpoint():
    logging.info("Received 2B scrape request via endpoint")
    if active_scrapes["2b"]:
        return {"message": "2B scraping is already running."}
    executor.submit(run_2b_scrape_job)
    return {"message": "2B scraping started in background."}


@app.post("/scrape/jumia")
async def trigger_jumia_scrape_endpoint():
    logging.info("Received Jumia scrape request via endpoint")
    if active_scrapes["jumia"]:
        return {"message": "Jumia scraping is already running."}
    executor.submit(run_jumia_scrape_job)
    return {"message": "Jumia scraping started in background."}


@app.get("/scrapers")
async def list_scrapers_endpoint():
    return ["Amazon", "Jumia", "2b"]


@app.get("/scrapers/status")
async def get_scraper_status_endpoint():
    return scraper_statuses
