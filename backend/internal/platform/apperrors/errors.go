package apperrors

import "errors"

// AppError represents a structured application error with an HTTP status code.
type AppError struct {
	Code       string
	Message    string
	StatusCode int
}

// Error implements the error interface.
func (e *AppError) Error() string {
	return e.Message
}

// Pre-defined application errors.
var (
	ErrNotFound      = &AppError{Code: "NOT_FOUND", Message: "Resource not found", StatusCode: 404}
	ErrUnauthorized  = &AppError{Code: "UNAUTHORIZED", Message: "Authentication required", StatusCode: 401}
	ErrForbidden     = &AppError{Code: "FORBIDDEN", Message: "Access denied", StatusCode: 403}
	ErrConflict      = &AppError{Code: "CONFLICT", Message: "Resource conflict", StatusCode: 409}
	ErrInternal      = &AppError{Code: "INTERNAL_ERROR", Message: "Internal server error", StatusCode: 500}
	ErrBadRequest    = &AppError{Code: "BAD_REQUEST", Message: "Bad request", StatusCode: 400}
	ErrUnprocessable = &AppError{Code: "UNPROCESSABLE", Message: "Business rule violation", StatusCode: 422}
)

// New creates a new AppError with the given code, message, and HTTP status code.
func New(code string, msg string, status int) *AppError {
	return &AppError{
		Code:       code,
		Message:    msg,
		StatusCode: status,
	}
}

// IsAppError checks whether err is an *AppError and returns it if so.
func IsAppError(err error) (*AppError, bool) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr, true
	}
	return nil, false
}

