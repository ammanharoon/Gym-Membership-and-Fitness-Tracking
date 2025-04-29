from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import unittest
import time


class GymSystemTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()
        cls.driver.maximize_window()
        cls.base_url = "http://localhost:3000"  # Update with your app's URL
        cls.wait = WebDriverWait(cls.driver, 10)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()


    def test_register_with_empty_name(self):
        """Test registration with empty name field"""
        self.driver.get(f"{self.base_url}/register")

        # Fill other fields except name
        email_field = self.driver.find_element(By.NAME, "email")
        email_field.send_keys("test@example.com")

        password_field = self.driver.find_element(By.NAME, "password")
        password_field.send_keys("testpassword123")

        # Click register button
        register_button = self.driver.find_element(By.XPATH, "//button[contains(text(),'Sign Up')]")
        register_button.click()

        # Verify the form didn't submit (should still be on register page)
        time.sleep(2)  # Wait for any potential redirect
        self.assertIn("/register", self.driver.current_url, "Page redirected despite empty name field")

        # Verify the name field has validation error (assuming HTML5 validation)
        name_field = self.driver.find_element(By.NAME, "name")
        is_invalid = "invalid" in name_field.get_attribute("class") or name_field.get_attribute("required")
        self.assertTrue(is_invalid, "Name field not marked as invalid")

    def test_successful_registration_redirect(self):
        """Test successful registration redirects to membership selection"""
        self.driver.get(f"{self.base_url}/register")

        # Generate unique email for each test run
        timestamp = int(time.time())
        test_email = f"testuser{timestamp}@example.com"

        # Fill all fields
        name_field = self.driver.find_element(By.NAME, "name")
        name_field.send_keys("Test User")

        email_field = self.driver.find_element(By.NAME, "email")
        email_field.send_keys(test_email)

        password_field = self.driver.find_element(By.NAME, "password")
        password_field.send_keys("testpassword123")

        # Click register button
        register_button = self.driver.find_element(By.XPATH, "//button[contains(text(),'Sign Up')]")
        register_button.click()

        # Verify redirect to membership selection
        self.wait.until(
            EC.url_contains("/membership-selection"),
            "Did not redirect to membership selection after registration"
        )

        # Verify we're on the membership selection page
        self.assertIn("/membership-selection", self.driver.current_url,
                      "Not on membership selection page after successful registration")

        # Verify the page loaded correctly
        page_title = self.wait.until(
            EC.visibility_of_element_located((By.XPATH, "//h2[contains(text(),'Select Your Membership')]"))
        )
        self.assertTrue(page_title.is_displayed(), "Membership selection page not loaded correctly")


if __name__ == "__main__":
    unittest.main()