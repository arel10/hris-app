package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/peoplecore/hris/internal/app"
	"github.com/peoplecore/hris/internal/config"
	"github.com/peoplecore/hris/internal/database"
	"github.com/peoplecore/hris/internal/server"
)

func main() {
	// Load .env file if present (ignore error if file doesn't exist)
	_ = godotenv.Load()

	// Load configuration from environment variables
	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	// Configure structured logging
	logLevel := slog.LevelInfo
	if cfg.AppEnv == "development" {
		logLevel = slog.LevelDebug
	}
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: logLevel})))

	slog.Info("starting server", "app", cfg.AppName, "env", cfg.AppEnv, "port", cfg.AppPort)

	// Connect to database
	db, err := database.Connect(cfg)
	if err != nil {
		slog.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	slog.Info("database connection established")

	// Run migrations
	if err := database.RunMigrations(db, cfg); err != nil {
		slog.Error("failed to run migrations", "error", err)
		os.Exit(1)
	}

	slog.Info("database migrations applied")

	// Wire dependencies
	deps := app.NewDependencies(db, cfg)

	// Setup HTTP server
	srv := server.New(cfg)
	srv.RegisterRoutes(deps)

	httpServer := &http.Server{
		Addr:         ":" + cfg.AppPort,
		Handler:      srv,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in background
	serverErr := make(chan error, 1)
	go func() {
		slog.Info("http server listening", "addr", httpServer.Addr)
		serverErr <- httpServer.ListenAndServe()
	}()

	// Wait for shutdown signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)

	select {
	case err := <-serverErr:
		slog.Error("server error", "error", err)
		os.Exit(1)
	case sig := <-quit:
		slog.Info("shutdown signal received", "signal", sig)
	}

	// Graceful shutdown
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		slog.Error("graceful shutdown failed", "error", err)
		os.Exit(1)
	}

	slog.Info("server shut down gracefully")
}

