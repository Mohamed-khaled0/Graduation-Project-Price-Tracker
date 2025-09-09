import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import os
import re
import logging
from concurrent.futures import ThreadPoolExecutor
import concurrent.futures
from typing import List, Dict, Any, Optional

MAX_FILE_LENGTH = 100
DEFAULT_IMAGE_DIR = os.path.join(os.path.dirname(__file__), "images")

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
log = logging.getLogger(__name__)


def get_num_workers(max_workers: Optional[int] = None) -> int:
    """Determines the number of workers for ThreadPoolExecutor."""
    if max_workers and max_workers > 0:
        return max_workers
    try:
        cpus = os.cpu_count()
        return cpus if cpus else 1
    except NotImplementedError:
        log.warning("Could not detect number of CPUs, defaulting to 1 worker.")
        return 1


def sanitize_filename(filename: str) -> str:
    """Removes illegal characters from a filename and truncates it."""
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
        log.warning(
            f"Skipping download for empty image URL (intended path: {image_path})"
        )
        return

    if os.path.exists(image_path):
        return

    try:
        if image_url.startswith("//"):
            image_url = "https:" + image_url
        elif not image_url.startswith("http"):
            log.warning(
                f"Skipping download for potentially invalid image URL: {image_url}"
            )
            return

        response = requests.get(image_url, timeout=timeout, stream=True)
        response.raise_for_status()
        with open(image_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        # log.debug(f"Successfully downloaded image to {image_path}")
    except requests.exceptions.RequestException as e:
        log.warning(f"Failed to download image {image_url}: {e}")
    except IOError as e:
        log.error(f"Failed to write image to {image_path}: {e}")
    except Exception as e:
        log.error(f"An unexpected error occurred downloading {image_url}: {e}")


class JumiaScraper:
    def __init__(
        self, image_dir: str = DEFAULT_IMAGE_DIR, max_workers: Optional[int] = None
    ):
        self.image_dir = image_dir
        self.num_workers = get_num_workers(max_workers)
        create_directory_if_not_exists(self.image_dir)
        log.info(
            f"JumiaScraper initialized. Image directory: {self.image_dir}, Workers: {self.num_workers}"
        )

        self.categories = {
            "laptops": {
                "url": "https://www.jumia.com.eg/laptops/?page={}",
            },
            "tvs": {
                "url": "https://www.jumia.com.eg/electronic-television-video/?page={}",
            },
            "cameras": {
                "url": "https://www.jumia.com.eg/cameras/?page={}",
            },
            # 'accessories_and_cables': {
            #     'url': 'https://www.jumia.com.eg/mobile-phone-accessories-cables/?page={}',
            #     'brands': [
            #         '2B', 'Acefast', 'Adam Elements', 'Anker', 'Apple', 'Aspor', 'Aukey', 'Baseus', 'Blitz',
            #         'Borofone', 'Buddy', 'Cable', 'Celebrat', 'Choetech', 'Corn', 'Coteetci', 'Dadu', 'Dausen', 'Devia',
            #         'Earldom', 'Eloroby', 'EMB', 'Energiemax', 'Energizer', 'Eugizmo', 'Genai', 'General', 'Generic',
            #         'Gerlax', 'GFUZ', 'GravaStar', 'Havit', 'Hoco', 'HP', 'Iconix', 'Iconz', 'Infinix', 'Inkax', 'Jellico',
            #         'JOYROOM', 'JSAUX', 'K3', 'Kingleen', 'Konfulon', "L'Avvento", 'Lanex', 'Ldino', 'Ldnio', 'Lightning',
            #         'Linein', 'Majentik', 'Manhattan', 'Mcdodo', 'Mcgear', 'Mi', 'Momax', 'MOMO', 'Moxom', 'Nillkin', 'Nubia',
            #         'Odoyo', 'Onten', 'Oraimo', 'Orimo', 'Over', 'Pavareal', 'Powerline', 'Proda', 'Promate', 'Ravpower',
            #         'realme', 'Recci', 'Remax', 'RockRose', 'Romoss', 'Samsung', 'Sanyon', 'Sendem', 'Shark', 'Sikenai',
            #         'Smart Gate', 'Soda', 'Strong', 'super touch', 'Tronsmart', 'Ugreen', 'Vidivi', 'Vidvie', 'WiWU', 'WK Design',
            #         'wopow', 'WUW', 'X-Plus', 'X-Scoot', 'XIAOMI', 'XO', 'Yesido'
            #     ]
            # },
            "phones": {
                "url": "https://www.jumia.com.eg/smartphones/?page={}",
                "brands": [
                    "Alcatel",
                    "Apple",
                    "Benco",
                    "Black Shark",
                    "CAT",
                    "Earldom",
                    "Generic",
                    "Honor",
                    "Iku",
                    "Infinix",
                    "Itel",
                    "Lava",
                    "Lenovo",
                    "M-Horse",
                    "Realme",
                    "Nokia",
                    "Nubia",
                    "OPPO",
                    "Poco",
                    "realme",
                    "Redmi",
                    "Samsung",
                    "TAG-PHONE",
                    "Tecno",
                    "unihertz",
                    "Vivo",
                    "VIVO MATTRESS",
                    "X-Plus",
                    "Xaomi",
                    "XIAOMI",
                    "ZTE",
                ],
            },
            # 'audio_and_video_accessories': {
            #     'url': 'https://www.jumia.com.eg/computing-audio-video-accessories/?page={}',
            #     'brands': [
            #         "2B", "A4tech", "Awei", "Axtel", "Boya", "Comica", "Corn", "Crash", "Dji", "Elgato",
            #         "FANTECH", "Forev", "GAMMA", "Generic", "Genius", "Gigamax", "Godox", "Golden King",
            #         "Goldenking", "Havit", "Hood", "HP", "HyperX", "Jabra", "Kisonili", "Kisonli",
            #         "L'Avvento", "Lenovo", "Logitech", "Manhattan", "Marvo", "Maxi", "Media Tech",
            #         "Meetion", "Microsoft", "Nacon", "Neutrik", "No Band", "Onikuma", "Ovleng", "P47",
            #         "Philips", "Point", "Porodo", "Porsh Dob", "Powerology", "Rapoo", "Razer", "Recci",
            #         "Redragon", "Rode", "Sades", "Saramonic", "Smile", "Soda", "SPEEDLINK", "Speed Link",
            #         "Standard", "SUNWIND", "Techno Zone", "TERMINATOR", "UNIC", "XO", "XTRIKE ME", "ZERO"
            #     ]
            # },
            "headphones": {
                "url": "https://www.jumia.com.eg/mobile-phone-bluetooth-headsets/?page={}",
                "brands": [
                    "Anker",
                    "Apple",
                    "B12",
                    "Belkin",
                    "Black Shark",
                    "Bose",
                    "Cardoo",
                    "Celebrat",
                    "Choetech",
                    "Cmf",
                    "Corn",
                    "Creative",
                    "Denmen",
                    "Devia",
                    "Dob",
                    "Earldom",
                    "E Train",
                    "Geekery",
                    "General",
                    "Generic",
                    "Harman",
                    "Hbq",
                    "Honor",
                    "Huawei",
                    "Iconz",
                    "Infinix",
                    "Inkax",
                    "iPlus",
                    "Itel",
                    "JBL",
                    "JOYROOM",
                    "Jumbo",
                    "Kitsound",
                    "L'Avvento",
                    "Lenovo",
                    "Logitech",
                    "Majentik",
                    "Marshall Minor",
                    "Mi",
                    "Nothing",
                    "One Plus",
                    "OPPO",
                    "Oraimo",
                    "P47",
                    "Philips",
                    "Proda",
                    "Promate",
                    "Qcy",
                    "Razer",
                    "realme",
                    "Recci",
                    "Redmi",
                    "Remax",
                    "RENO",
                    "Riversong",
                    "Samsung",
                    "Skyworth",
                    "Smart",
                    "Soda",
                    "SODO",
                    "Sony",
                    "Soundcore",
                    "SOUNDPEATS",
                    "Sports",
                    "Telzeal",
                    "Tronsmart",
                    "Ugreen",
                    "Unitronics",
                    "Vidvie",
                    "WUW",
                    "XIAOMI",
                    "X Loud",
                    "XO",
                    "YISON",
                    "Yk Design",
                    "YooKie",
                    "ZERO",
                ],
            },
            # 'chargers_and_power_adapters': {
            #     'url': 'https://www.jumia.com.eg/mobile-phone-accessories-cables/?page={}', # Note: This URL seems to be the same as accessories_and_cables
            #     'brands': [
            #         '2B', 'Acefast', 'Adam Elements', 'Anker', 'Apple', 'Aspor', 'Aukey', 'Awei', 'Baseus', 'Blitz',
            #         'Borofone', 'Buddy', 'Cable', 'Celebrat', 'Choetech', 'Corn', 'Coteetci', 'Dadu', 'Dausen', 'Devia',
            #         'Earldom', 'Eloroby', 'EMB', 'Energiemax', 'Energizer', 'Eugizmo', 'Genai', 'General', 'Generic',
            #         'Gerlax', 'GFUZ', 'GravaStar', 'Havit', 'Hoco', 'HP', 'Iconix', 'Iconz', 'Infinix', 'Inkax', 'Jellico',
            #         'JOYROOM', 'JSAUX', 'K3', 'Kingleen', 'Konfulon', "L'Avvento", 'Lanex', 'Ldino', 'Ldnio', 'Lightning',
            #         'Linein', 'Majentik', 'Manhattan', 'Mcdodo', 'Mcgear', 'Mi', 'Momax', 'MOMO', 'Moxom', 'Nillkin', 'Nubia',
            #         'Odoyo', 'Onten', 'Oraimo', 'Orimo', 'Over', 'Pavareal', 'Powerline', 'Proda', 'Promate', 'Ravpower',
            #         'realme', 'Recci', 'Remax', 'RockRose', 'Romoss', 'Samsung', 'Sanyon', 'Sendem', 'Shark', 'Sikenai',
            #         'Smart Gate', 'Soda', 'Strong', 'super touch', 'Tronsmart', 'Ugreen', 'Vidivi', 'Vidvie', 'WiWU', 'WK Design',
            #         'wopow', 'WUW', 'X-Plus', 'X-Scoot', 'XIAOMI', 'XO', 'Yesido'
            #     ]
            # },
            # 'computer_cables_and_interconnects': {
            #     'url': 'https://www.jumia.com.eg/computer-cables-interconnects/?page={}#catalog-listing',
            #     'brands': [
            #         '2B', '3M', 'Adapter', 'admin', 'Anker', 'Apple', 'Baci', 'Baseus', 'Belkin', 'Black Box', 'Blitz', 'Cable',
            #         'CABLETIME', 'Choetech', 'Cisco', 'Comma', 'D-Link', 'Dadu', 'Devia', 'Earldom', 'Eti', 'E Train', 'Fort',
            #         'France Tech', 'General', 'Generic', 'Grand', 'Havit', 'High Quality', 'Hikvision', 'HP', 'Iconz', 'JOYROOM',
            #         'JSAUX', 'Jumbo', 'Kongda', "L'Avvento", 'Lan', 'Lava', 'LAVVENTO', 'Ldnio', 'Leader', 'Legrand', 'Leviton',
            #         'Manhattan', 'MOMO', 'Not Specific', 'Onten', 'Oraimo', 'Panduit Netkey', 'Point', 'Port', 'Power A', 'Premium',
            #         'Premium Line', 'PROLINK', 'Promate', 'Raoop', 'REDERIMIDE', 'Riversong', 'Rock', 'RockRose', 'Sikenai',
            #         'SoundKing', 'Spark Fox', 'SPEEDLINK', 'Systimax', 'Tera', 'TOTAL', 'TP-Link', 'Ugreen', 'VABi', 'Vega', 'Vidvie',
            #         'WiWU', 'World Cables', 'WUW', 'X-Scoot', 'XO', 'Yesido', 'ZERO'
            #     ]
            # },
            "desktop_computers": {
                "url": "https://www.jumia.com.eg/desktop-computers/?page={}",
                "brands": [
                    "Acer",
                    "Apple",
                    "ASUS",
                    "Dell",
                    "HP",
                    "Lenovo",
                    "MSI",
                    "Microsoft",
                    "Razer",
                    "Samsung",
                    "Toshiba",
                    "Xerox",
                    "Zotac",
                ],
            },
            # 'external_hd': {
            #     'url': 'https://www.jumia.com.eg/external-hd/?page={}',
            #     'brands': [
            #         'Ugreen', 'Redragon', 'Western', 'Sandisk', 'WD', 'Sytek', 'Universal', 'Samsung'
            #     ]
            # },
            # 'fans_cooling': {
            #     'url': 'https://www.jumia.com.eg/computer-components-fans-cooling/?page={}',
            #     'brands': [
            #         'Cooler Master', 'Corsair', 'Gigamax', 'Thermaltake', 'Ipega',
            #         'Arctic', 'Thermal', 'Gigamax', 'SilverStone', 'Aorus', 'Techno'
            #     ]
            # },
            # "gaming_laptops": {
            #     "url": "https://www.jumia.com.eg/gaming-laptops/?page={}",
            #     "brands": [
            #         "Acer",
            #         "Alienware",
            #         "Apple",
            #         "Asus",
            #         "Dell",
            #         "Gigabyte",
            #         "HP",
            #         "Lenovo",
            #         "MSI",
            #         "Razer",
            #         "Samsung",
            #         "Toshiba",
            #         "XPG",
            #         "Xiaomi",
            #     ],
            # },
            "gpus": {
                "url": "https://www.jumia.com.eg/computer-components-graphics-cards/?page={}",
                "brands": [
                    "ASUS",
                    "MSI",
                    "Gigabyte",
                    "Zotac",
                    "EVGA",
                    "Palit",
                    "NVIDIA",
                    "AMD",
                    "Sapphire",
                    "XFX",
                    "PNY",
                    "PowerColor",
                    "Intel",
                ],
            },
            # 'internal_hd': {
            #     'url': 'https://www.jumia.com.eg/internal-hd/?page={}',
            #     'brands': [
            #         'Crucial', 'Lexar', 'Samsung', 'Seagate', 'Team Group', 'Toshiba', 'WD', 'Western Digital'
            #     ]
            # },
            "phones": {
                "url": "https://www.jumia.com.eg/ios-phones/?page={}",
                "brands": ["Apple"],
            },
            "ipads": {
                "url": "https://www.jumia.com.eg/ipads/?page={}",
                "brands": ["apple"],
            },
            # 'keyboards': {
            #     'url': 'https://www.jumia.com.eg/computer-keyboards/?page={}#catalog-listing',
            #     'brands': [
            #         "2B", "A4tech", "AiTNT", "Apple", "Aula", "E Train", "Firex", "Forever",
            #         "General", "Generic", "Gigamax", "Green Lion", "HP", "Iconz", "L'Avvento",
            #         "LAVVENTO", "Logitech", "Manhattan", "Meetion", "Microsoft", "Point", "Razer",
            #         "Redragon", "Smile", "Soda", "SPEEDLINK", "Vesta", "White Shark", "XO", "ZERO"
            #     ]
            # },
            # 'memory_cards': {
            #     'url': 'https://www.jumia.com.eg/mobile-phone-memory-cards/?page={}',
            #     'brands': [
            #         'Adata', 'ADATA', 'Angelbird', 'Apacer', 'Bavvo', 'Blex', 'Corsair', 'Crucial', 'Evo',
            #         'Hikvision', 'Kingston', 'Lexar', 'Sandisk', 'Mushkin', 'Patriot', 'sanDisk', 'Samsung',
            #         'Toshiba', 'Transcend', 'Verbatim', 'Vitec', 'Western Digital', 'Yesido'
            #     ]
            # },
            "monitors": {
                "url": "https://www.jumia.com.eg/monitors/?page={}",
                "brands": [
                    "Acer",
                    "Alienware",
                    "Aoc",
                    "Benq",
                    "Dahua",
                    "DELL",
                    "Elgato",
                    "Generic",
                    "HP",
                    "Lenovo",
                    "Lumi",
                    "MSI",
                    "Philips",
                    "Samsung",
                    "XIAOMI",
                ],
            },
            # 'mouses': {
            #     'url': 'https://www.jumia.com.eg/mouse/?page={}#catalog-listing',
            #     'brands': [
            #         '2B', 'A4tech', 'Apple', 'Aula', 'E Train', 'FANTECH', 'Fd', 'Forev', 'Fort', 'Fox', 'GAMMA',
            #         'Generic', 'Genius', 'Gigamax', 'Golden King', 'Goldenking', 'Grand', 'Havit', 'Hb', 'Hood', 'HP',
            #         'Iconz', 'Jertech', "L'Avvento", 'Lava', 'LAVVENTO', 'Leishe', 'Lenovo', 'Logitech', 'Manhattan',
            #         'Margo', 'Marvo', 'Meetion', 'Microsoft', 'Ox', 'Point', 'Porsh', 'R8', 'Raoop', 'Rapoo', 'Redragon',
            #         'Smile', 'Soda', 'Soyntec', 'SPEEDLINK', 'T-Dagger', 'Twins', 'UNBLACK', 'Utopia', 'XO', 'XP',
            #         'XTRIKE ME', 'Yafox', 'ZERO', 'ZIDLI', 'ZornWee'
            #     ]
            # },
            # 'network_adapters': {
            #     'url': 'https://www.jumia.com.eg/network-adapters/?page={}#catalog-listing',
            #     'brands': [
            #         "2B", "Air Live", "Aruba", "Buddy", "D-Link", "Generic", "Gigabite",
            #         "I-ROCK", "Iconz", "Lb Link", "Legrand", "Manhattan", "Mercusys",
            #         "Netgear", "Point", "tenda", "TP-Link", "TPLink", "Ugreen"
            #     ]
            # },
            # 'network_routers': {
            #     'url': 'https://www.jumia.com.eg/computer-networking-routers/?page={}#catalog-listing',
            #     'brands': [
            #         'Air Live', 'Asus', 'D-Link', 'Generic', 'Green', 'Mercury', 'Mercusys',
            #          'Mikrotik', 'tenda', 'TP-Link', 'TPLink', 'Ubiquiti', 'XIAOMI'
            #     ]
            # },
            # 'networking_hubs': {
            #     'url': 'https://www.jumia.com.eg/networking-hubs/?page={}#catalog-listing',
            #     'brands': [
            #         "Adam Elements", "Baseus", "Earldom", "Generic", "Jcpal", "JSAUX",
            #         "L'Avvento", "LAVVENTO", "Manhattan", "Onten", "Promate", "QGeeM",
            #         "Recci", "TP-Link", "TPLink", "Ugreen", "WiWU", "Yesido"
            #     ]
            # },
            # 'networking_switches': {
            #     'url': 'https://www.jumia.com.eg/computer-networking-switches/?page={}#catalog-listing',
            #     'brands': [
            #         "Air Live", "Aruba", "At Netgear", "Cisco", "D-Link", "Dtech", "Generic",
            #         "Hikvision", "Linksys", "Mercusys", "Mikrotik", "Ruiji", "Ruijie",
            #         "Tenda", "TP-Link", "TPLink"
            #     ]
            # },
            # 'phone_adapters': {
            #     'url': 'https://www.jumia.com.eg/mobile-phone-adapters/?page={}',
            #     'brands': [
            #         'Acefast', 'Adam Elements', 'Apple', 'Denmen', 'Devia', 'Earldom', 'Egeline', 'Generic', 'HP',
            #         'JOYROOM', 'JSAUX', 'Ldino', 'Ldnio', 'Mcdodo', 'Powerline', 'Recci', 'Remax', 'Samsung',
            #         'Standard', 'WiWU', 'X-Scoot', 'Yesido','OTG'
            #     ]
            # },
            # 'phone_batteries': {
            #     'url': 'https://www.jumia.com.eg/mobile-phone-batteries-battery-packs/?page={}',
            #     'brands': [
            #         'Anker', 'Awei', 'Dadu', 'Devia', 'Earldom', 'Elite', 'Energizer', 'Eveready', 'France Tech',
            #         'Genai', 'Generic', 'Havit', 'Hoco', 'Iconz', 'JOYROOM', 'Kakusiga', 'Konfulon', "L'Avvento",
            #         'Lanex', 'Ldnio', 'Lenovo', 'LYZ', 'Majentik', 'Matrix', 'Mi', 'Momax', 'Oraimo', 'Powerology',
            #         'Proda', 'Promate', 'Puridea', 'Pzx', 'Ravpower', 'Recci', 'Remax', 'RENO', 'Riversong', 'RockRose',
            #         'Samsung', 'Start', 'SUNPIN', 'Ugreen', 'Usams', 'Vidvie', 'WiWU', 'XO', 'Yesido', 'Yk Design', 'ZTE'
            #     ]
            # },
            # 'powerbanks': {
            #     'url': 'https://www.jumia.com.eg/mlp-portable-power-banks/?page={}',
            #     'brands': [
            #         'Anker', 'Awei', 'Dadu', 'Devia', 'Earldom', 'Energizer', 'Genai', 'Generic', 'Havit',
            #         'Hoco', 'JOYROOM', 'Kakusiga', 'Konfulon', "L'Avvento", 'Lanex', 'Ldnio', 'LYZ', 'Majentik',
            #         'Matrix', 'Mi', 'Momax', 'Oraimo', 'Powerology', 'Pzx', 'Ravpower', 'Recci', 'Remax', 'RENO',
            #         'RockRose', 'Samsung', 'Start', 'SUNPIN', 'Ugreen', 'Usams', 'Vidvie', 'WiWU', 'XO', 'Yesido'
            #     ]
            # },
            # 'printers': {
            #     'url': 'https://www.jumia.com.eg/printers/?page={}#catalog-listing',
            #     'brands': [
            #         "Bixolon", "Brother", "Canon", "Epson", "Generic", "HP", "Kyocera",
            #         "Lenovo", "Muratec", "Pantum", "TSC", "Xerox", "XP", "XPrinter", "Zebra"
            #     ]
            # },
            # 'scanners': {
            #     'url': 'https://www.jumia.com.eg/scanners/?page={}#catalog-listing',
            #     'brands': [
            #         'HP', 'TP-Link', 'Penpower', 'Ugreen', 'Canon', 'Epson','Oka'
            #     ]
            # },
            # "smart_watches": {
            #     "url": "https://www.jumia.com.eg/smart-watches/?page={}",
            #     "brands": ["Apple", "Samsung", "Huawei", "Xiaomi", "Garmin"],
            # },
            # 'tablets': {
            #     'url': 'https://www.jumia.com.eg/tablets/?page={}#catalog-listing',
            #     'brands': [
            #         'honor', 'huawei', 'lenovo', 'samsung', 'xiaomi'
            #     ]
            # },
            # 'usb_flash_drives': {
            #     'url': 'https://www.jumia.com.eg/flash-drives/?page={}',
            #     'brands': [
            #         'Adam Elements', 'Dahua', 'Eaget', 'Eti', 'Evo',  'Generic', 'Hiksemi',
            #         'Hikvision', 'Iconix', 'Kingston', 'KIOXIA', 'Lexar', 'Normal', 'Redragon',
            #         'Sandisk', 'Sytek', 'Universal', 'Zoser'
            #     ]
            # },
            "wireless_access_points": {
                "url": "https://www.jumia.com.eg/wireless-access-points/?page={}#catalog-listing",
                "brands": [
                    "Air Live",
                    "Aruba",
                    "D-Link",
                    "Grandstream",
                    "Linksys",
                    "Mercusys",
                    "Mikrotik",
                    "Ruijie",
                    "Tenda",
                    "TP-Link",
                    "TPLink",
                ],
            },
        }

    def get_product_data(self, product, category_name: str) -> Optional[Dict[str, Any]]:
        """Extracts unified product data from a BeautifulSoup product tag."""
        try:
            title_tag = product.find("h3", {"class": "name"})
            title = title_tag.get_text(strip=True) if title_tag else "N/A"

            price_tag = product.find("div", {"class": "prc"})
            price = (
                price_tag.get_text(strip=True).replace("EGP", "").strip()
                if price_tag
                else "N/A"
            )

            link_tag = product.find("a", {"class": "core"})
            product_url = (
                "https://www.jumia.com.eg" + link_tag["href"]
                if link_tag and link_tag.get("href")
                else "N/A"
            )

            img_tag = product.find("img", {"class": "img"})
            image_url = (
                img_tag["data-src"] if img_tag and "data-src" in img_tag.attrs else None
            )
            if not image_url and img_tag and "src" in img_tag.attrs:
                image_url = img_tag["src"]

            if title == "N/A" or product_url == "N/A":
                log.warning("Skipping product due to missing title or URL.")
                return None

            sanitized_title = sanitize_filename(title)
            image_filename = f"{sanitized_title}.jpg"
            image_local_path = os.path.join(self.image_dir, image_filename)

            return {
                "product_title": title,
                "product_price": price,
                "product_url": product_url,
                "product_image_url": image_url,
                "product_image_local_path": image_local_path,
                "platform": "Jumia",
                "category": category_name,
            }

        except Exception as e:
            log.error(f"Error extracting data from product tag: {e}")
            return None

    def scrape_page(
        self, url: str, category_name: str
    ) -> Optional[List[Dict[str, Any]]]:
        """Scrapes unified product data from a given Jumia page URL."""
        log.debug(f"Scraping Jumia page: {url} for category: {category_name}")
        try:
            response = requests.get(url, timeout=20)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")
            products = soup.find_all("article", {"class": "prd _fb col c-prd"})

            if not products:
                log.info(f"No product articles found on page {url}.")
                return []

            page_data = []
            for product_article in products:
                product_data = self.get_product_data(product_article, category_name)
                if product_data:
                    page_data.append(product_data)

            log.info(f"Found {len(page_data)} products on page {url}")
            return page_data

        except requests.exceptions.RequestException as e:
            log.error(f"HTTP request failed for page {url}: {e}")
            return None
        except Exception as e:
            log.error(f"Error scraping page {url}: {e}")
            return None

    def scrape_category(
        self,
        category_name: str,
        req_timeout: int = 20,
        max_retries: int = 3,
        retry_delay: float = 1.0,
    ) -> List[Dict[str, Any]]:
        """Scrapes all pages for a given category and downloads images."""
        if category_name not in self.categories:
            log.error(f"Category '{category_name}' not found in configuration.")
            return []

        category_info = self.categories[category_name]
        base_url = category_info["url"]
        all_scraped_products: List[Dict[str, Any]] = []
        page_num = 1

        log.info(f"Starting scraping for category: {category_name}")

        with ThreadPoolExecutor(max_workers=self.num_workers) as executor:
            futures = []
            while True:
                page_url = base_url.format(page_num)
                log.info(f"Scraping page {page_num} of {category_name}: {page_url}")

                page_data = None
                for attempt in range(max_retries):
                    page_data = self.scrape_page(page_url, category_name)
                    if page_data is not None:
                        break
                    log.warning(
                        f"Retrying page {page_url} (Attempt {attempt + 1}/{max_retries}) after delay..."
                    )
                    time.sleep(retry_delay * (attempt + 1))
                else:
                    log.error(
                        f"Max retries reached for page {page_url}. Skipping this page for category '{category_name}'."
                    )
                    break  # Stop processing this category if a page fails consistently

                if not page_data:
                    log.info(
                        f"No more products found for {category_name} on page {page_num}."
                    )
                    break

                all_scraped_products.extend(page_data)

                for product in page_data:
                    if product.get("product_image_url"):
                        futures.append(
                            executor.submit(
                                download_image,
                                product["product_image_url"],
                                product["product_image_local_path"],
                                req_timeout,
                            )
                        )

                page_num += 1
                # time.sleep(0.5)

            log.info(
                f"Waiting for {len(futures)} image downloads for category {category_name}..."
            )
            for future in concurrent.futures.as_completed(futures):
                try:
                    future.result()
                except Exception as exc:
                    log.error(f"Image download generated an exception: {exc}")

        log.info(
            f"Finished scraping category: {category_name}. Found {len(all_scraped_products)} products."
        )
        return all_scraped_products

    def save_to_excel(self, data, filename):
        """Saves data to an Excel file."""
        if not data:
            log.warning(f"No data provided to save for {filename}.")
            return

        try:
            df = pd.DataFrame(data)
            output_dir = os.path.join(os.path.dirname(__file__), "output_excel")
            create_directory_if_not_exists(output_dir)
            file_path = os.path.join(output_dir, f"{filename}.xlsx")

            df.to_excel(file_path, index=False, engine="openpyxl")
            log.info(f"Data saved to {file_path}")
        except ImportError:
            log.error(
                "Pandas or openpyxl not installed. Cannot save to Excel. pip install pandas openpyxl"
            )
        except Exception as e:
            log.error(f"Failed to save data to Excel file {filename}: {e}")

    def scrape_all(self) -> List[Dict[str, Any]]:
        """Scrapes all defined categories and returns a combined list."""
        all_data = []
        total_start_time = time.time()
        # For testing, scrape only a subset of categories
        # categories_to_scrape = list(self.categories.keys())[:2] # Scrape first 2 categories
        categories_to_scrape = list(self.categories.keys())  # Scrape all

        for category_name in categories_to_scrape:
            category_start_time = time.time()
            product_data = self.scrape_category(category_name)
            category_end_time = time.time()
            log.info(
                f"Category '{category_name}' scraped in {category_end_time - category_start_time:.2f} seconds."
            )
            if product_data:
                all_data.extend(product_data)
                # self.save_to_excel(product_data, f"jumia_{category_name}") # Save per category if needed
        total_end_time = time.time()
        log.info(
            f"Finished scraping all specified categories in {total_end_time - total_start_time:.2f} seconds. Total products: {len(all_data)}"
        )
        # self.save_to_excel(all_data, "jumia_all_products") # Save all combined data
        return all_data


if __name__ == "__main__":
    log.info("Running Jumia scraper script directly...")
    start_time = time.time()

    jumia_scraper = JumiaScraper()

    # scrape a specific categories
    # scraped_data = jumia_scraper.scrape_category("wireless_access_points")
    scraped_data = jumia_scraper.scrape_all()
    # or all defined categories
    # scraped_data = jumia_scraper.scrape_all()

    end_time = time.time()

    print(scraped_data)

    log.info(f"Jumia scraping finished in {end_time - start_time:.2f} seconds.")
    log.info(f"Total products scraped: {len(scraped_data)}")

    if scraped_data:
        log.info("First 5 scraped products:")
        for item in scraped_data[:5]:
            log.info(f"- Title: {item['product_title'][:60]}...")
            log.info(f"  Price: {item['product_price']}")
            log.info(f"  Category: {item['category']}")  # Log the new category field
            log.info(f"  URL: {item['product_url']}")
            log.info(f"  Image URL: {item.get('product_image_url', 'N/A')}")
            log.info(f"  Local Path: {item.get('product_image_local_path', 'N/A')}")
            log.info(f"  Platform: {item['platform']}")
    else:
        log.info("No products were scraped.")
