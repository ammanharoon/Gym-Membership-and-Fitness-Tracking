import unittest
import time
import random
import string
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class TrainerAuthenticationTests(unittest.TestCase):
    """Test cases for the trainer authentication system."""

    def setUp(self):
        """Set up the WebDriver before each test."""
        # Initialize Chrome WebDriver with options
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")  # Run in headless mode (no GUI)
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")

        self.driver = webdriver.Chrome(options=options)
        self.base_url = "http://localhost:3000"
        self.wait = WebDriverWait(self.driver, 15)  # Increased timeout
        self.driver.implicitly_wait(5)  # Global implicit wait

    def tearDown(self):
        """Clean up after each test."""
        # Save screenshot if test failed
        if hasattr(self, '_outcome') and any(error for (_, error) in self._outcome.errors):
            timestamp = time.strftime("%Y%m%d-%H%M%S")
            self.driver.save_screenshot(f"test_failure_{timestamp}.png")

        # Print browser console logs
        try:
            for entry in self.driver.get_log('browser'):
                print(f"[BROWSER LOG] {entry['level']}: {entry['message']}")
        except:
            pass

        # Handle any unexpected alerts
        try:
            alert = self.driver.switch_to.alert
            alert.dismiss()
        except:
            pass

        self.driver.quit()

    def generate_random_email(self):
        """Generate a random email for test registrations."""
        random_string = ''.join(random.choice(string.ascii_lowercase) for _ in range(10))
        return f"{random_string}@test.com"

    def test_register_empty_name(self):
        """Test Case 2: Verify validation when name field is empty in registration form."""
        self.driver.get(f"{self.base_url}/trainer-register")

        # Wait for form to be completely loaded
        form = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))

        # Fill in all fields except name
        self.driver.find_element(By.NAME, "email").send_keys(self.generate_random_email())
        self.driver.find_element(By.NAME, "password").send_keys("testpassword")
        self.driver.find_element(By.NAME, "expertise").send_keys("Strength Training")
        self.driver.find_element(By.NAME, "phone").send_keys("1234567890")

        # Submit the form
        submit_button = self.wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Register')]")))
        submit_button.click()

        # Handle validation - now checking for inline error message
        try:
            error_message = self.wait.until(
                EC.visibility_of_element_located(
                    (By.XPATH, "//input[@name='name']/following-sibling::p[contains(@class,'text-red-500')]"))
            )
            self.assertIn("required", error_message.text.lower())
        except TimeoutException:
            self.fail("Validation error for empty name field did not appear")

        # Verify we're still on registration page
        self.assertIn("/trainer-register", self.driver.current_url,
                      f"Expected to stay on registration page, got {self.driver.current_url}")

    def test_successful_registration(self):
        """Test Case 3: Verify successful registration when all fields are filled."""
        self.driver.get(f"{self.base_url}/trainer-register")
        self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))

        # Generate random email to avoid conflicts
        test_email = self.generate_random_email()

        # Fill in all fields
        self.driver.find_element(By.NAME, "name").send_keys("Test Trainer")
        self.driver.find_element(By.NAME, "email").send_keys(test_email)
        self.driver.find_element(By.NAME, "password").send_keys("Test@1234")  # Stronger password
        self.driver.find_element(By.NAME, "confirmPassword").send_keys("Test@1234")
        self.driver.find_element(By.NAME, "expertise").send_keys("Strength Training")
        self.driver.find_element(By.NAME, "phone").send_keys("1234567890")

        # Submit the form
        submit_button = self.wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Register')]")))
        submit_button.click()

        # Handle either success or failure
        try:
            # Wait for either redirect or error message
            WebDriverWait(self.driver, 15).until(
                lambda driver: (
                        "/trainer-login" in driver.current_url or
                        driver.find_elements(By.XPATH, "//div[contains(@class,'error')]")
                )
            )

            if "/trainer-login" in self.driver.current_url:
                print("Successfully redirected to login page")
            else:
                error = self.driver.find_element(By.XPATH, "//div[contains(@class,'error')]")
                self.fail(f"Registration failed with error: {error.text}")

        except TimeoutException:
            self.driver.save_screenshot("registration_timeout.png")
            self.fail("Registration did not complete within timeout period")

    def test_successful_login(self):
        """Test Case 6: Verify successful login redirects to dashboard."""
        # First register a trainer
        test_email = self.generate_random_email()
        self._register_test_trainer(test_email, "Login Test Trainer", "Test@1234", "Yoga", "1234567890")

        # Now test login
        self.driver.get(f"{self.base_url}/trainer-login")

        # Wait for login form to be completely ready
        form = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))

        # Fill login form
        email_field = self.wait.until(EC.element_to_be_clickable((By.NAME, "email")))
        password_field = self.driver.find_element(By.NAME, "password")

        email_field.send_keys(test_email)
        password_field.send_keys("Test@1234")

        # Submit form
        submit_button = self.wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Log In')]")))
        submit_button.click()

        # Verify redirect to dashboard
        try:
            self.wait.until(EC.url_contains("/trainer-dashboard"))

            # Additional verification - check if auth tokens are set
            token = self.driver.execute_script("return localStorage.getItem('trainerToken');")
            trainer_id = self.driver.execute_script("return localStorage.getItem('trainerId');")

            self.assertIsNotNone(token, "Authentication token not found in localStorage")
            self.assertIsNotNone(trainer_id, "Trainer ID not found in localStorage")

        except TimeoutException:
            current_url = self.driver.current_url
            self.fail(f"Failed to redirect to dashboard. Current URL: {current_url}")

    def _register_test_trainer(self, email, name, password, expertise, phone):
        """Helper method to register a test trainer."""
        self.driver.get(f"{self.base_url}/trainer-register")
        self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))

        # Fill registration form
        self.driver.find_element(By.NAME, "name").send_keys(name)
        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "password").send_keys(password)
        self.driver.find_element(By.NAME, "confirmPassword").send_keys(password)
        self.driver.find_element(By.NAME, "expertise").send_keys(expertise)
        self.driver.find_element(By.NAME, "phone").send_keys(phone)

        # Submit form
        submit_button = self.wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Register')]")))
        submit_button.click()

        # Wait for registration to complete
        try:
            self.wait.until(lambda driver: (
                    "/trainer-login" in driver.current_url or
                    driver.find_elements(By.XPATH, "//div[contains(@class,'error')]")
            ))

            if "/trainer-login" not in self.driver.current_url:
                error = self.driver.find_element(By.XPATH, "//div[contains(@class,'error')]")
                raise Exception(f"Registration failed: {error.text}")

        except TimeoutException:
            raise Exception("Registration did not complete within timeout period")


if __name__ == "__main__":
    unittest.main(failfast=True)  # Stop on first failure