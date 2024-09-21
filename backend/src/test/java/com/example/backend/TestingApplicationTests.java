package com.example.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * This class contains integration tests for the TestingApplication.
 * It uses the "test" profile to load test-specific configurations.
 */
@SpringBootTest
@ActiveProfiles("test")
class TestingApplicationTests {

	/**
	 * This test verifies that the application context loads successfully.
	 * If this test passes, it means that the basic configuration of the
	 * application is correct and all required beans are properly initialized.
	 */
	@Test
	void contextLoads() {
		// The test will fail if the application context cannot be loaded
	}

	// Add more specific tests for your application here
}
