package validator

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	govalidator "github.com/go-playground/validator/v10"
	"github.com/peoplecore/hris/internal/platform/response"
)

// Validator wraps go-playground/validator for use in HTTP handlers.
type Validator struct {
	v *govalidator.Validate
}

// New creates a new Validator instance.
func New() *Validator {
	return &Validator{v: govalidator.New()}
}

// Validate validates the given struct and returns a slice of FieldError.
// Returns nil if validation passes.
func (val *Validator) Validate(i interface{}) []response.FieldError {
	err := val.v.Struct(i)
	if err == nil {
		return nil
	}

	var fieldErrors []response.FieldError
	var validationErrs govalidator.ValidationErrors
	if ok := isValidationErrors(err, &validationErrs); ok {
		for _, fe := range validationErrs {
			fieldErrors = append(fieldErrors, response.FieldError{
				Field:   strings.ToLower(fe.Field()),
				Message: humanizeTag(fe),
			})
		}
	} else {
		fieldErrors = append(fieldErrors, response.FieldError{
			Field:   "unknown",
			Message: err.Error(),
		})
	}

	return fieldErrors
}

// ValidateAndRespond decodes the JSON body of r into dst, validates it,
// and writes a validation error response if validation fails.
// Returns true if validation passed, false otherwise.
func (val *Validator) ValidateAndRespond(w http.ResponseWriter, r *http.Request, dst interface{}) bool {
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", "Invalid JSON body: "+err.Error())
		return false
	}

	if errs := val.Validate(dst); errs != nil {
		response.ValidationError(w, errs)
		return false
	}

	return true
}

// isValidationErrors attempts to unwrap a govalidator.ValidationErrors from err.
func isValidationErrors(err error, out *govalidator.ValidationErrors) bool {
	if ve, ok := err.(govalidator.ValidationErrors); ok {
		*out = ve
		return true
	}
	return false
}

// humanizeTag converts a validator tag to a human-readable message.
func humanizeTag(fe govalidator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", strings.ToLower(fe.Field()))
	case "email":
		return fmt.Sprintf("%s must be a valid email address", strings.ToLower(fe.Field()))
	case "min":
		return fmt.Sprintf("%s must be at least %s characters", strings.ToLower(fe.Field()), fe.Param())
	case "max":
		return fmt.Sprintf("%s must not exceed %s characters", strings.ToLower(fe.Field()), fe.Param())
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s", strings.ToLower(fe.Field()), fe.Param())
	default:
		return fmt.Sprintf("%s failed validation: %s", strings.ToLower(fe.Field()), fe.Tag())
	}
}

