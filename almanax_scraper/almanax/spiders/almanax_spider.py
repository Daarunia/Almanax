import scrapy
import time
import json
import re
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from scrapy import signals
from scrapy.http import HtmlResponse
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, ElementClickInterceptedException, TimeoutException

class AlmanaxSpider(scrapy.Spider):
    name = 'almanax_spider'
    allowed_domains = ['www.krosmoz.com']

    def __init__(self, *args, **kwargs):
        super(AlmanaxSpider, self).__init__(*args, **kwargs)
        # Configuration de Selenium
        chrome_options = Options()
        # chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_experimental_option(
            "excludeSwitches", ["enable-logging"])

        # Initialisation du WebDriver Selenium
        self.driver = webdriver.Chrome(options=chrome_options)

    def start_requests(self):
        date = datetime(2028, 1, 1)
        end_date = datetime(2029, 1, 1)
        while date < end_date:
            date_str = date.strftime("%Y-%m-%d")
            url = f'https://www.krosmoz.com/fr/almanax/{date_str}';
            yield scrapy.Request(url, cb_kwargs={"target_url": url,"date": date_str})
            date += timedelta(days=1)

    def parse(self, response, target_url, date):
        self.logger.info(f"🔗 Accès à {response.url}")
        self.driver.get(response.url)

        try:
            # Attente que les éléments soient chargés (max 10 secondes)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".achievement.dofus")))

            # Récupère tous les éléments correspondants
            elements = self.driver.find_elements(
                By.CSS_SELECTOR, ".achievement.dofus .fleft")

            cleaned = (elements[0].text.replace("Récupérer ", "")
                       .replace("et rapporter l'offrande à Théodoran Ax", "")
                       .strip())

            numbers = re.findall(r'\d+', cleaned)      
            quantity = [int(n) for n in numbers]       
            object_name = re.sub(r'\d+', '', cleaned).strip() 

            yield {
                "object": object_name,
                "quantity": quantity[0],
                "date": date,
                "url": target_url
            }

        except TimeoutException:
            self.logger.warning(
                "Aucun élément '.achievement.dofus' trouvé dans le délai imparti.")
