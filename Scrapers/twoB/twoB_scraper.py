import requests
from bs4 import BeautifulSoup
import time
import os
import re
import logging
from concurrent.futures import ThreadPoolExecutor
import concurrent.futures
from typing import List, Dict, Any, Optional

MAX_FILE_LENGTH = 100
DEFAULT_IMAGE_DIR = os.path.join(os.path.dirname(__file__), "images")


HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0"
}

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
log = logging.getLogger(__name__)


def get_num_workers(max_workers: Optional[int] = None) -> int:
    if max_workers and max_workers > 0:
        return max_workers
    try:
        cpus = os.cpu_count()
        return cpus if cpus else 1
    except NotImplementedError:
        log.warning("Could not detect number of CPUs, defaulting to 1 worker.")
        return 1


def sanitize_filename(filename: str) -> str:
    sanitized = re.sub(r'[\\/*?:"<>|]', "", filename)
    sanitized = re.sub(r"\s+", "_", sanitized)
    return sanitized[: MAX_FILE_LENGTH - 5]


def create_directory_if_not_exists(dir_path: str):
    if not os.path.exists(dir_path):
        try:
            os.makedirs(dir_path)
            log.info(f"Created directory: {dir_path}")
        except OSError as e:
            log.error(f"Failed to create directory {dir_path}: {e}")
            raise


def download_image(image_url: str, image_path: str, timeout: int = 20):
    if not image_url:
        log.warning(f"Skipping download for empty image URL (path: {image_path})")
        return

    if os.path.exists(image_path):
        return
    try:
        if not image_url.startswith("http"):
            log.warning(
                f"Skipping download for potentially invalid image URL: {image_url}"
            )
            return
        response = requests.get(
            image_url, headers=HEADERS, timeout=timeout, stream=True
        )
        response.raise_for_status()
        with open(image_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        log.debug(f"Successfully downloaded image {image_url} to {image_path}")
    except requests.exceptions.RequestException as e:
        log.warning(f"Failed to download image {image_url}: {e}")
    except IOError as e:
        log.error(f"Failed to write image to {image_path}: {e}")
    except Exception as e:
        log.error(f"An unexpected error occurred downloading {image_url}: {e}")


def get_product_details(
    product_li: BeautifulSoup, image_dir: str, category_name: str
) -> Optional[Dict[str, Any]]:
    try:
        link_tag = product_li.find("a", {"class": "product-item-link"})
        title = link_tag.get_text(strip=True) if link_tag else "N/A"
        product_url = link_tag["href"] if link_tag and link_tag.get("href") else "N/A"

        price = "N/A"
        special_price_container = product_li.find("span", {"class": "special-price"})
        if special_price_container:
            price_tag = special_price_container.find("span", {"class": "price"})
            if price_tag:
                price = (
                    price_tag.get_text(strip=True)
                    .replace("\xa0", "")
                    .replace("EGP", "")
                )

        if price == "N/A":
            price_tag = product_li.find("span", {"class": "price"})
            if price_tag:
                price = (
                    price_tag.get_text(strip=True)
                    .replace("\xa0", "")
                    .replace("EGP", "")
                )

        img_tag = product_li.find("img", {"class": "product-image-photo"})
        image_url = None
        if img_tag:
            if "src" in img_tag.attrs and img_tag["src"]:
                image_url = img_tag["src"]
            elif "data-src" in img_tag.attrs and img_tag["data-src"]:
                image_url = img_tag["data-src"]

        if title == "N/A" or product_url == "N/A":
            log.warning("Skipping product due to missing title or URL.")
            return None

        sanitized_title = sanitize_filename(title)
        image_filename = f"{sanitized_title}.jpg"
        image_local_path = os.path.join(image_dir, image_filename)

        return {
            "product_title": title,
            "product_price": price,
            "product_url": product_url,
            "product_image_url": image_url,
            "product_image_local_path": image_local_path,
            "platform": "2B",
            "category": category_name,
        }
    except Exception as e:
        log.error(f"Error extracting data from 2B product tag: {e}")
        return None


def scrape_page(
    url: str, image_dir: str, category_name: str, req_timeout: int = 20
) -> Optional[List[Dict[str, Any]]]:
    log.debug(f"Scraping 2B page: {url} for category: {category_name}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=req_timeout)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        log.error(f"HTTP request failed for 2B page {url}: {e}")
        return None

    soup = BeautifulSoup(response.content, "html.parser")
    product_list_items = soup.find_all("li", {"class": "item product product-item"})

    if not product_list_items:
        log.info(f"No product list items found on 2B page {url}.")
        return []

    page_data = []
    for item in product_list_items:
        product_data = get_product_details(item, image_dir, category_name)
        if product_data:
            page_data.append(product_data)

    log.info(f"Found {len(page_data)} products on 2B page {url}")
    return page_data


def scrape_2b_categories(
    category_url_templates: Dict[str, str],
    image_dir: str = DEFAULT_IMAGE_DIR,
    max_workers: Optional[int] = None,
    req_timeout: int = 20,
    max_retries: int = 3,
    retry_delay: float = 1.0,
) -> List[Dict[str, Any]]:
    num_workers = get_num_workers(max_workers)
    create_directory_if_not_exists(image_dir)
    log.info(
        f"Starting 2B scraper. Image directory: {image_dir}, Workers: {num_workers}"
    )

    all_scraped_products: List[Dict[str, Any]] = []

    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        for category_name, base_url_template in category_url_templates.items():
            log.info(f"--- Processing 2B Category: {category_name} ---")

            page_num = 1
            category_futures = []

            while True:
                page_url = base_url_template.format(page_num)
                log.info(f"Scraping page {page_num} for {category_name}: {page_url}")

                page_data = None
                for attempt in range(max_retries):
                    page_data = scrape_page(
                        page_url, image_dir, category_name, req_timeout
                    )
                    if page_data is not None:
                        break
                    log.warning(
                        f"Retrying 2B page {page_url} (Attempt {attempt + 1}/{max_retries}) after delay..."
                    )
                    # time.sleep(retry_delay * (attempt + 1))
                else:
                    log.error(
                        f"Max retries reached for 2B page {page_url}. Skipping page for category '{category_name}'."
                    )

                if page_data is None:
                    log.error(
                        f"Failed to fetch data for {category_name} on page {page_num} after max retries. Stopping this category."
                    )
                    break
                if not page_data:
                    log.info(
                        f"No more products found for {category_name} on page {page_num}."
                    )
                    break

                all_scraped_products.extend(page_data)

                for product in page_data:
                    if product.get("product_image_url"):
                        category_futures.append(
                            executor.submit(
                                download_image,
                                product["product_image_url"],
                                product["product_image_local_path"],
                                req_timeout,
                            )
                        )

                page_num += 1

            log.info(
                f"Waiting for {len(category_futures)} image downloads for category {category_name}..."
            )
            for future in concurrent.futures.as_completed(category_futures):
                try:
                    future.result()
                except Exception as exc:
                    log.error(f"Image download generated an exception: {exc}")

            log.info(f"Finished processing 2B category: {category_name}")

    log.info(
        f"Finished scraping all 2B categories. Total products found: {len(all_scraped_products)}"
    )
    return all_scraped_products


if __name__ == "__main__":
    log.info("Running 2B scraper script directly...")
    start_time = time.time()

    sample_categories_for_direct_run = {
        "laptops": "https://2b.com.eg/en/computers/laptops.html?p={}&product_list_limit=48",
        "tvs": "https://2b.com.eg/en/televisions.html?p={}&product_list_limit=48",
    }

    scraped_data = scrape_2b_categories(
        category_url_templates=sample_categories_for_direct_run
    )
    # print(scraped_data)

    end_time = time.time()

    log.info(f"2B scraping finished in {end_time - start_time:.2f} seconds.")
    log.info(f"Total products scraped: {len(scraped_data)}")

    if scraped_data:
        log.info("First 5 scraped products from 2B:")
        for item in scraped_data[:5]:
            log.info(f"- Title: {item['product_title'][:60]}...")
            log.info(f"  Price: {item['product_price']}")
            log.info(f"  Category: {item['category']}")
            log.info(f"  URL: {item['product_url']}")
            log.info(f"  Image URL: {item.get('product_image_url', 'N/A')}")
            log.info(f"  Local Path: {item.get('product_image_local_path', 'N/A')}")
            log.info(f"  Platform: {item['platform']}")
    else:
        log.info("No products were scraped from 2B.")

