package com.example.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.MapPropertySource;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@EnableAsync
@ComponentScan(basePackages = "com.example.backend")
public class TestingApplication {

	// List of environment variables to load
	private static final String[] ENV_VARS = {
		"MONGODB_URI", "SPRING_SECURITY_USER", "SPRING_SECURITY_USER_PASSWORD",
		"SPRING_SECURITY_ADMIN", "SPRING_SECURITY_ADMIN_PASSWORD",
		"SPRING_MAIL_USERNAME", "SPRING_MAIL_PASSWORD"
	};

	public static void main(String[] args) {
		// Load environment variables from .env file
		ConfigurableEnvironment env = loadEnvironment();
		
		// Create and run the Spring application with custom environment
		SpringApplication app = new SpringApplication(TestingApplication.class);
		app.setEnvironment(env);
		app.run(args);
	}

	/**
	 * Loads environment variables from .env file and system environment.
	 * @return ConfigurableEnvironment with loaded variables
	 */
	private static ConfigurableEnvironment loadEnvironment() {
		StandardEnvironment env = new StandardEnvironment();
		MutablePropertySources propertySources = env.getPropertySources();
		Map<String, Object> envMap = new HashMap<>();

		try {
			// Load .env file
			Dotenv dotenv = loadDotEnvFile();

			// Load and log each environment variable
			for (String key : ENV_VARS) {
				loadAndLogVariable(key, dotenv, envMap);
			}

			// Add loaded variables to the environment
			propertySources.addFirst(new MapPropertySource("dotenvProperties", envMap));
		} catch (Exception e) {
			System.err.println("Error loading .env file: " + e.getMessage());
			e.printStackTrace();
		}

		// Log final environment state
		logFinalEnvironmentState(env);

		return env;
	}

	/**
	 * Loads the .env file and prints debug information.
	 * @return Dotenv object with loaded variables
	 */
	private static Dotenv loadDotEnvFile() {
		System.out.println("Current working directory: " + System.getProperty("user.dir"));
		System.out.println("Attempting to load .env file...");
		
		Dotenv dotenv = Dotenv.configure()
				.directory(".")
				.ignoreIfMissing()
				.load();
		
		System.out.println(".env file loaded successfully");
		
		// Print all loaded environment variables (for debugging)
		dotenv.entries().forEach(entry -> 
			System.out.println("Loaded from .env: " + entry.getKey() + "=" + entry.getValue())
		);

		return dotenv;
	}

	/**
	 * Loads a single environment variable and logs its state.
	 * @param key The name of the environment variable
	 * @param dotenv The Dotenv object containing variables from .env file
	 * @param envMap The map to store the loaded variable
	 */
	private static void loadAndLogVariable(String key, Dotenv dotenv, Map<String, Object> envMap) {
		String value = dotenv.get(key);
		System.out.println("Loading " + key + ":");
		System.out.println("  Value from .env: " + (value != null ? "****" : "null"));
		System.out.println("  Current System.getenv(): " + (System.getenv(key) != null ? "****" : "null"));
		System.out.println("  Current System.getProperty(): " + (System.getProperty(key) != null ? "****" : "null"));

		if (value != null && !value.isEmpty()) {
			envMap.put(key, value);
			System.setProperty(key, value);
			System.out.println("  Variable set in environment");
		} else {
			System.out.println("  Variable not set (null or empty in .env)");
		}
	}

	/**
	 * Logs the final state of important environment variables.
	 * @param env The ConfigurableEnvironment to check
	 */
	private static void logFinalEnvironmentState(ConfigurableEnvironment env) {
		System.out.println("\nFinal Environment State:");
		for (String key : new String[]{"MONGODB_URI", "SPRING_SECURITY_USER", "SPRING_SECURITY_ADMIN"}) {
			System.out.println(key + ": " + (env.getProperty(key) != null ? "****" : "null"));
		}
	}
}
