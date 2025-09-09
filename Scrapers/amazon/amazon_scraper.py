import json
import logging
import os
import re
import sqlite3
import time

from concurrent.futures import ThreadPoolExecutor
import concurrent.futures
from typing import List, Dict, Any, Optional

import requests
from bs4 import BeautifulSoup

MAX_FILE_LENGTH = 100
DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "db", "amazon_products.db")
DEFAULT_IMAGE_DIR = os.path.join(os.path.dirname(__file__), "images")
DEFAULT_HEADERS_PATH = os.path.join(os.path.dirname(__file__), "..", "headers.json")
DEFAULT_BASE_URL = (
    "https://www.amazon.eg/s?i=electronics&rh={}&fs=true&page={}&language=en&"
)

DEFAULT_CATEGORIES = [
    {"n%3A21833212031": "cpu"},
    # {"n%3A21833215031": "gpu"},
    {"n%3A21832918031": "data_storage"},
    # {"n%3A21832907031": "laptop"},
]

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
log = logging.getLogger(__name__)


def get_num_workers(max_workers: Optional[int] = None) -> int:
    """Determines the number of workers for ThreadPoolExecutor."""
    if max_workers and max_workers > 0:
        return max_workers
    try:
        # Use all available cores if not specified
        cpus = os.cpu_count()
        return cpus if cpus else 1
    except NotImplementedError:
        log.warning("Could not detect number of CPUs, defaulting to 1 worker.")
        return 1


def sanitize_filename(filename: str) -> str:
    """Removes illegal characters from a filename and truncates it."""
    # Remove characters that are illegal chars from filenames
    sanitized = re.sub(r'[\\/*?:"<>|]', "", filename)
    # Replace multiple spaces/newlines with a single underscore
    sanitized = re.sub(r"\s+", "_", sanitized)
    return sanitized[: MAX_FILE_LENGTH - 5]  # reserve space for image extensions


def load_headers(headers_path: str) -> Dict[str, str]:
    """Loads headers from a JSON file."""
    try:
        with open(headers_path) as header_file:
            config = json.load(header_file)
            if "headers" in config and isinstance(config["headers"], dict):
                return config["headers"]
            else:
                log.error(
                    f"Headers file '{headers_path}' does not contain a valid 'headers' dictionary."
                )
                return {}
    except FileNotFoundError:
        log.error(f"Headers file not found at '{headers_path}'")
        return {}
    except json.JSONDecodeError:
        log.error(f"Error decoding JSON from headers file '{headers_path}'")
        return {}
    except Exception as e:
        log.error(f"An error occurred loading headers from '{headers_path}': {e}")
        return {}


def create_directory_if_not_exists(dir_path: str):
    """Creates a directory if it doesn't exist."""
    if not os.path.exists(dir_path):
        try:
            os.makedirs(dir_path)
            log.info(f"Created directory: {dir_path}")
        except OSError as e:
            log.error(f"Failed to create directory {dir_path}: {e}")
            raise


def insert_products_into_db(product_list: List[Dict[str, Any]], db_path: str):
    """Inserts a list of product dictionaries into the SQLite database."""
    if not product_list:
        log.info("No products to insert into the database.")
        return

    log.info(f"Attempting to insert into DB. db_path: {db_path}")  # Add logging
    db_dir = os.path.dirname(db_path)
    log.info(f"Derived db_dir: {db_dir}")  # Add logging
    create_directory_if_not_exists(db_dir)

    conn = None
    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()

        c.execute(
            """CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                price TEXT,
                link TEXT UNIQUE, -- Added UNIQUE constraint to avoid duplicates
                category TEXT,
                image_path TEXT,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )"""
        )

        insert_query = """
            INSERT OR IGNORE INTO products (title, price, link, category, image_path)
            VALUES (?, ?, ?, ?, ?)
            """

        products_to_insert = [
            (
                p["title"],
                p["price"],
                p["link"],
                p["category"],
                p["image_path"],
            )
            for p in product_list
        ]

        c.executemany(insert_query, products_to_insert)
        inserted_count = conn.total_changes
        log.info(
            f"Attempted to insert {len(products_to_insert)} products. {c.rowcount} rows affected (may include ignored duplicates)."
        )

        conn.commit()

    except sqlite3.Error as e:
        log.error(f"Database error occurred: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        log.error(f"An unexpected error occurred during database insertion: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
            log.info(f"Database connection closed for {db_path}")


def download_image(image_url: str, image_path: str, timeout: int = 20):
    """Downloads an image from a URL and saves it to a path."""
    if not image_url:
        log.warning(
            f"Skipping download for empty image URL (intended path: {image_path})"
        )
        return
    try:
        if os.path.exists(image_path):
            return
        else:
            response = requests.get(image_url, timeout=timeout, stream=True)
            response.raise_for_status()
            with open(image_path, "wb") as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)

    except requests.exceptions.RequestException as e:
        log.warning(f"Failed to download image {image_url}: {e}")
    except IOError as e:
        log.error(f"Failed to write image to {image_path}: {e}")
    except Exception as e:
        log.error(f"An unexpected error occurred downloading {image_url}: {e}")


def scrape_categories(
    categories: List[Dict[str, str]],
    headers: Dict[str, str],
    db_path: str = DEFAULT_DB_PATH,
    image_dir: str = DEFAULT_IMAGE_DIR,
    base_url: str = DEFAULT_BASE_URL,
    max_workers: Optional[int] = None,
    req_timeout: int = 20,
    max_retries: int = 5,
    retry_delay: float = 0.5,
) -> List[Dict[str, Any]]:
    """
    Scrapes Amazon product listings for given categories.

    Args:
        categories: A list of dictionaries, where each dict maps category_id to category_name.
        headers: Dictionary of HTTP headers for requests.
        db_path: Path to the SQLite database file.
        image_dir: Directory to save downloaded product images.
        base_url: The base URL template for category/page searches.
        max_workers: Maximum number of threads for concurrent tasks (downloads). Defaults to CPU count.
        req_timeout: Timeout in seconds for HTTP requests.
        max_retries: Maximum number of retries for failed HTTP requests.
        retry_delay: Delay in seconds between retries.

    Returns:
        A list of dictionaries, each containing details of a scraped product.
    """
    scraped_products: List[Dict[str, Any]] = []
    num_workers = get_num_workers(max_workers)
    log.info(f"Using {num_workers} workers for concurrent tasks.")

    create_directory_if_not_exists(image_dir)
    log.info(f"Ensured image directory exists: {image_dir}")

    if not headers:
        log.error("No headers provided. Scraping will likely fail. Aborting.")
        return []

    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = []

        for category_dict in categories:
            for category_id, category_name in category_dict.items():
                log.info(f"Processing category: {category_name} (ID: {category_id})")
                page = 1
                while True:
                    url = base_url.format(category_id, page)
                    log.info(f"Scraping URL: {url} (Page: {page})")

                    response = None
                    for attempt in range(max_retries):
                        try:
                            response = requests.get(
                                url, headers=headers, timeout=req_timeout
                            )
                            response.raise_for_status()
                            log.debug(
                                f"Successfully fetched {url} (status: {response.status_code})"
                            )
                            break
                        except requests.exceptions.Timeout:
                            log.warning(
                                f"Request timed out for {url} (Attempt {attempt + 1}/{max_retries})"
                            )
                        except requests.exceptions.RequestException as e:
                            log.warning(
                                f"Request failed for {url} (Attempt {attempt + 1}/{max_retries}): {e}"
                            )

                        if attempt < max_retries - 1:
                            time.sleep(retry_delay * (attempt + 1))
                        else:
                            log.error(
                                f"Max retries reached for {url}. Skipping this page."
                            )
                            response = None
                            break

                    if response is None:
                        break

                    soup = BeautifulSoup(response.content, "html.parser")

                    no_results_element = soup.find("div", class_="s-no-results")
                    if (
                        no_results_element
                        and "No results for" in no_results_element.get_text(strip=True)
                    ):
                        log.info(
                            f"No more results found for category '{category_name}' on page {page}."
                        )
                        break

                    product_divs = soup.find_all(
                        "div", {"data-component-type": "s-search-result"}
                    )

                    if not product_divs:
                        log.warning(
                            f"Could not find product divs with 'data-component-type' on page {page} for {category_name}. Checking layout."
                        )

                        next_page_link = soup.find("a", class_="s-pagination-next")
                        if (
                            not next_page_link
                            or "s-pagination-disabled"
                            in next_page_link.get("class", [])
                        ):
                            log.info(
                                f"Reached end of results (or empty page with no next button) for {category_name} on page {page}."
                            )
                            break
                        else:
                            log.warning(
                                f"No product divs found, but 'next page' exists. Layout might have changed. Skipping page {page}."
                            )
                            page += 1
                            continue  # continue to the next page

                    log.info(
                        f"Found {len(product_divs)} potential products on page {page}."
                    )

                    for div in product_divs:
                        title, price, link, image_url = "N/A", "N/A", "N/A", None

                        # Title
                        title_element = div.find("h2")
                        if title_element:
                            title_span = title_element.find(
                                "span", class_="a-text-normal"
                            )
                            if title_span:
                                title = title_span.text.strip()
                            else:
                                title = title_element.text.strip()
                        if title == "N/A":
                            log.warning("Title not found in product div.")

                        # Price
                        price_div = div.find("span", class_="a-price")
                        if price_div:
                            whole_price = price_div.find("span", class_="a-price-whole")
                            fraction_price = price_div.find(
                                "span", class_="a-price-fraction"
                            )
                            if whole_price:
                                price = whole_price.text.strip().replace(",", "")
                                if fraction_price:
                                    price += fraction_price.text.strip()
                            else:
                                price_text_span = price_div.find(
                                    "span", class_="a-offscreen"
                                )
                                if price_text_span:
                                    price = price_text_span.text.strip()
                        if price == "N/A":
                            log.info(f"Price not found for product '{title[:30]}...'")

                        # Link
                        link_element = div.find("a", class_="a-link-normal", href=True)
                        if link_element and link_element["href"].startswith("/"):
                            link = "https://www.amazon.eg" + link_element["href"]

                            # Clean up URL parameters
                            link = link.split("/ref=")[0]
                            link = link.split("?")[0]
                        if link == "N/A":
                            log.warning(f"Link not found for product '{title[:30]}...'")

                        # Image
                        image_element = div.find("img", class_="s-image")
                        if image_element and "src" in image_element.attrs:
                            image_url = image_element["src"]
                        if not image_url:
                            log.warning(
                                f"Image URL not found for product '{title[:30]}...'"
                            )

                        if title != "N/A" and link != "N/A":
                            log.info(f"Found: {title[:50]}... | Price: {price}")
                            sanitized_title = sanitize_filename(title)
                            image_filename = f"{sanitized_title}.jpg"
                            image_path = os.path.join(image_dir, image_filename)

                            # Standardized product data structure
                            product_data = {
                                "product_title": title,
                                "product_url": link,
                                "product_image_url": image_url,
                                "product_image_local_path": image_path,
                                "platform": "Amazon",
                                "price": price,
                                "category": category_name,
                            }
                            scraped_products.append(product_data)

                            if image_url:
                                futures.append(
                                    executor.submit(
                                        download_image,
                                        image_url,
                                        image_path,
                                        req_timeout,
                                    )
                                )
                        else:
                            log.warning(
                                "Skipping product due to missing title or link."
                            )

                    next_page_link = soup.find("a", class_="s-pagination-next")
                    if (
                        not next_page_link
                        or "s-pagination-disabled" in next_page_link.get("class", [])
                    ):
                        log.info(
                            f"No 'next page' button found or it's disabled. End of results for {category_name}."
                        )
                        break
                    else:
                        page += 1
                        # time.sleep(0.5)

            log.info(f"Finished processing category: {category_name}")

    # Wait for all downloads to complete
    for future in concurrent.futures.as_completed(futures):
        try:
            future.result()
        except Exception as exc:
            log.error(f"Image download generated an exception: {exc}")

    log.info(
        f"Scraping complete. Found {len(scraped_products)} products across all categories."
    )

    products_for_db = [
        {
            "title": p["product_title"],
            "price": p.get("price", "N/A"),  # Get price if available
            "link": p["product_url"],
            "category": p.get("category", "N/A"),  # Get category if available
            "image_path": p["product_image_local_path"],
        }
        for p in scraped_products
    ]

    if db_path:
        insert_products_into_db(products_for_db, db_path)
    else:
        log.info("Database path not provided, skipping database insertion.")

    # Return the standardized list
    return scraped_products


if __name__ == "__main__":
    log.info("Running Amazon scraper script directly...")

    CONFIG_HEADERS_PATH = os.path.join(os.path.dirname(__file__), "..", "headers.json")

    CONFIG_IMAGE_DIR = os.path.join(os.path.dirname(__file__), "images")

    CONFIG_DB_PATH = os.path.join(os.path.dirname(__file__), "db", "amazon_products.db")
    CONFIG_CATEGORIES = DEFAULT_CATEGORIES
    CONFIG_BASE_URL = DEFAULT_BASE_URL
    CONFIG_MAX_WORKERS = get_num_workers()

    headers = load_headers(CONFIG_HEADERS_PATH)

    if not headers:
        log.error("Could not load headers. Exiting.")
        exit(1)

    start_time = time.time()
    scraped_data = scrape_categories(
        categories=CONFIG_CATEGORIES,
        headers=headers,
        db_path=CONFIG_DB_PATH,
        image_dir=CONFIG_IMAGE_DIR,
        base_url=CONFIG_BASE_URL,
        max_workers=CONFIG_MAX_WORKERS,
        req_timeout=25,
        max_retries=50,
    )
    end_time = time.time()
    print(scraped_data)

    log.info(f"Scraping finished in {end_time - start_time:.2f} seconds.")
    log.info(f"Total products scraped: {len(scraped_data)}")

    # for item in scraped_data[:5]:
    #    print(f"- {item['title']} ({item['price']})")
