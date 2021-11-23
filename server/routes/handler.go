package routes

import (
	svc "github.com/noreng-jg/bastion-machine/server/services"
)

type Handler struct {
	session *svc.Session
}

func NewHandler(s *svc.Session) *Handler {
	return &Handler{session: s}
}
