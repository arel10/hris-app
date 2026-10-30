package config

import (
	"errors"
	"os"
	"strings"
	"time"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	AppEnv  string
	AppPort string
	AppName string

	DatabaseURL string

	JWTAccessSecret  string
	JWTRefreshSecret string
	JWTAccessTTL     time.Duration
	JWTRefreshTTL    time.Duration

	CORSAllowedOrigins []string

	StorageDriver    string
	StorageLocalPath string
}

// Load reads configuration from environment variables and validates required fields.
func Load() (*Config, error) {
	cfg := &Config{
		AppEnv:  getEnv("APP_ENV", "development"),
		AppPort: getEnv("APP_PORT", "8080"),
		AppName: getEnv("APP_NAME", "peoplecore-api"),

		DatabaseURL: os.Getenv("DATABASE_URL"),

		JWTAccessSecret:  os.Getenv("JWT_ACCESS_SECRET"),
		JWTRefreshSecret: os.Getenv("JWT_REFRESH_SECRET"),

		StorageDriver:    getEnv("STORAGE_DRIVER", "local"),
		StorageLocalPath: getEnv("STORAGE_LOCAL_PATH", "./storage"),
	}

	// Parse CORS allowed origins
	corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if corsOrigins != "" {
		cfg.CORSAllowedOrigins = strings.Split(corsOrigins, ",")
		for i, o := range cfg.CORSAllowedOrigins {
			cfg.CORSAllowedOrigins[i] = strings.TrimSpace(o)
		}
	}

	// Parse JWT TTLs
	accessTTLStr := getEnv("JWT_ACCESS_TTL", "15m")
	accessTTL, err := time.ParseDuration(accessTTLStr)
	if err != nil {
		return nil, errors.New("invalid JWT_ACCESS_TTL: " + err.Error())
	}
	cfg.JWTAccessTTL = accessTTL

	refreshTTLStr := getEnv("JWT_REFRESH_TTL", "168h")
	refreshTTL, err := time.ParseDuration(refreshTTLStr)
	if err != nil {
		return nil, errors.New("invalid JWT_REFRESH_TTL: " + err.Error())
	}
	cfg.JWTRefreshTTL = refreshTTL

	// Validate required fields
	if err := validate(cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}

// validate checks that all required configuration fields are non-empty.
func validate(cfg *Config) error {
	required := map[string]string{
		"DATABASE_URL":       cfg.DatabaseURL,
		"JWT_ACCESS_SECRET":  cfg.JWTAccessSecret,
		"JWT_REFRESH_SECRET": cfg.JWTRefreshSecret,
	}

	for key, val := range required {
		if strings.TrimSpace(val) == "" {
			return errors.New("required environment variable is missing or empty: " + key)
		}
	}

	return nil
}

// getEnv returns the value of the environment variable or a default value.
func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

