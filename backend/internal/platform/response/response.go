package response

import (
	"encoding/json"
	"net/http"
)

// Response is the standard API response envelope.
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
	Error   *ErrorBody  `json:"error,omitempty"`
}

// Meta holds pagination metadata.
type Meta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// ErrorBody holds structured error information.
type ErrorBody struct {
	Code    string       `json:"code"`
	Details []FieldError `json:"details,omitempty"`
}

// FieldError represents a validation error for a specific field.
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// JSON writes a JSON response with the given status code.
func JSON(w http.ResponseWriter, status int, msg string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	resp := Response{
		Success: status >= 200 && status < 300,
		Message: msg,
		Data:    data,
	}
	_ = json.NewEncoder(w).Encode(resp)
}

// Success writes a 200 OK JSON response.
func Success(w http.ResponseWriter, msg string, data interface{}) {
	JSON(w, http.StatusOK, msg, data)
}

// Paginated writes a 200 OK JSON response with pagination metadata.
func Paginated(w http.ResponseWriter, msg string, data interface{}, meta *Meta) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	resp := Response{
		Success: true,
		Message: msg,
		Data:    data,
		Meta:    meta,
	}
	_ = json.NewEncoder(w).Encode(resp)
}

// Created writes a 201 Created JSON response.
func Created(w http.ResponseWriter, msg string, data interface{}) {
	JSON(w, http.StatusCreated, msg, data)
}

// NoContent writes a 204 No Content response.
func NoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

// Error writes a JSON error response.
func Error(w http.ResponseWriter, status int, code string, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	resp := Response{
		Success: false,
		Message: msg,
		Error: &ErrorBody{
			Code: code,
		},
	}
	_ = json.NewEncoder(w).Encode(resp)
}

// ValidationError writes a 422 Unprocessable Entity JSON response with field-level errors.
func ValidationError(w http.ResponseWriter, details []FieldError) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnprocessableEntity)
	resp := Response{
		Success: false,
		Message: "Validation failed",
		Error: &ErrorBody{
			Code:    "VALIDATION_ERROR",
			Details: details,
		},
	}
	_ = json.NewEncoder(w).Encode(resp)
}

