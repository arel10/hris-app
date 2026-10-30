package pagination

import (
	"net/http"
	"strconv"
	"strings"
)

// Params holds pagination, search, and sort parameters parsed from an HTTP request.
type Params struct {
	Page      int
	Limit     int
	Search    string
	SortBy    string
	SortOrder string
}

// FromRequest parses pagination parameters from query string.
// defaultSortBy is used when no sort_by is provided.
// allowedSortCols restricts valid sort_by values; if empty, all values are allowed.
func FromRequest(r *http.Request, defaultSortBy string, allowedSortCols []string) Params {
	q := r.URL.Query()

	page := parseIntWithDefault(q.Get("page"), 1)
	if page < 1 {
		page = 1
	}

	limit := parseIntWithDefault(q.Get("limit"), 20)
	if limit < 1 {
		limit = 1
	}

	search := strings.TrimSpace(q.Get("search"))

	sortBy := q.Get("sort_by")
	if sortBy == "" {
		sortBy = defaultSortBy
	} else if len(allowedSortCols) > 0 && !contains(allowedSortCols, sortBy) {
		sortBy = defaultSortBy
	}

	sortOrder := strings.ToUpper(q.Get("sort_order"))
	if sortOrder != "ASC" && sortOrder != "DESC" {
		sortOrder = "ASC"
	}

	return Params{
		Page:      page,
		Limit:     limit,
		Search:    search,
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}
}

// Offset returns the SQL OFFSET value for the current page.
func (p Params) Offset() int {
	return (p.Page - 1) * p.Limit
}

// ClampedLimit returns p.Limit clamped to [1, max].
func (p Params) ClampedLimit(max int) int {
	if p.Limit > max {
		return max
	}
	return p.Limit
}

// parseIntWithDefault parses s as an integer; returns defaultVal on error.
func parseIntWithDefault(s string, defaultVal int) int {
	if s == "" {
		return defaultVal
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return defaultVal
	}
	return v
}

// contains checks whether target is in the slice.
func contains(slice []string, target string) bool {
	for _, s := range slice {
		if s == target {
			return true
		}
	}
	return false
}

