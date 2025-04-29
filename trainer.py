import unittest
import time
import random
import string
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


class TrainerE2ETests(unittest.TestCase):
    """End-to-end tests for trainer workflow."""

    def setUp(self):
        """Initialize test environment."""
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(5)
        self.base_url = "http://localhost:3000"
        self.wait = WebDriverWait(self.driver, 15)

        # Generate unique test data
        self.test_suffix = ''.join(random.choices(string.ascii_lowercase, k=8))
        self.test_email = f"trainer_{self.test_suffix}@test.com"
        self.test_password = "ValidPass123!"
        self.test_name = f"Trainer {self.test_suffix}"
        self.test_expertise = "Functional Training"
        self.test_phone = "555" + ''.join(random.choices(string.digits, k=7))

    def tearDown(self):
        """Clean up test environment."""
        self.driver.quit()

    def test_complete_trainer_workflow(self):
        """Test full trainer registration to program creation flow."""
        # 1. Trainer Registration
        self._test_trainer_registration()

        # 2. Trainer Login
        self._test_trainer_login()

        # 3. Dashboard Access
        self._test_dashboard_navigation()

        # 4. Program Creation
        self._test_program_creation()

    def _test_trainer_registration(self):
        """Test trainer registration process."""
        self.driver.get(f"{self.base_url}/trainer-register")

        # Fill registration form
        form_fields = {
            "name": self.test_name,
            "email": self.test_email,
            "password": self.test_password,
            "expertise": self.test_expertise,
            "phone": self.test_phone
        }

        for field_name, value in form_fields.items():
            element = self.wait.until(
                EC.element_to_be_clickable((By.NAME, field_name)))
            element.clear()
            element.send_keys(value)

            # Submit registration
            submit_button = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(text(),'Register')]")))
            submit_button.click()

            # Verify redirect to login page
        try:
            self.wait.until(
                lambda driver: "/trainer-login" in driver.current_url or
                               "/Login" in driver.current_url)
        except TimeoutException:
            self.fail("Failed to redirect after registration")

    def _test_trainer_login(self):
        """Test trainer login process."""
        # Ensure we're on login page
        if "/trainer-login" not in self.driver.current_url and "/Login" not in self.driver.current_url:
            self.driver.get(f"{self.base_url}/trainer-login")

        # Fill login form
        self.wait.until(
            EC.element_to_be_clickable((By.NAME, "email"))).send_keys(self.test_email)
        self.driver.find_element(By.NAME, "password").send_keys(self.test_password)

        # Submit login
        self.wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Log In')]"))).click()

        # Verify dashboard access
        self.wait.until(
            lambda driver: "/trainer-dashboard" in driver.current_url)

    def _test_dashboard_navigation(self):
        """Test dashboard navigation and tabs."""
        # Verify welcome message
        self.wait.until(
            EC.visibility_of_element_located(
                (By.XPATH, "//h1[contains(., 'Welcome')]")))

        # Verify all tabs are present
        expected_tabs = ["Overview", "My Programs", "My Clients", "Add Program"]
        for tab_name in expected_tabs:
            self.wait.until(
                EC.presence_of_element_located(
                    (By.XPATH, f"//button[contains(., '{tab_name}')]")))

    def _test_program_creation(self):
        """Test creating a new training program."""
        # Navigate to Add Program tab
        self.wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Add Program')]"))).click()

        # Fill program details
        program_details = {
            "name": f"Test Program {self.test_suffix}",
            "description": f"Test description {self.test_suffix}",
            "duration": "4 weeks"
        }

        for field_name, value in program_details.items():
            element = self.wait.until(
                EC.element_to_be_clickable((By.NAME, field_name)))
            element.clear()
            element.send_keys(value)

        # Fill session exercises
        session_inputs = self.driver.find_elements(
            By.XPATH, "//input[contains(@placeholder, 'Enter exercises')]")

        for i, session_input in enumerate(session_inputs[:2], 1):
            session_input.clear()
            session_input.send_keys(f"Exercise {i} for session {i}")

        # Submit program
        submit_button = self.wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Create Program')]")))
        submit_button.click()

        # Verify program appears in UI
        try:
            self.wait.until(
                EC.visibility_of_element_located(
                    (By.XPATH, f"//*[contains(., '{program_details['name']}')]")))
        except TimeoutException:
            self.fail("New program did not appear in UI after creation")


if __name__ == "__main__":
    unittest