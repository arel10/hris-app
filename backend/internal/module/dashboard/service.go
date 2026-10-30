package dashboard

import (
	"context"
)

type Service interface {
	GetSummary(ctx context.Context) (*SummaryResponse, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetSummary(ctx context.Context) (*SummaryResponse, error) {
	return s.repo.GetSummary(ctx)
}

