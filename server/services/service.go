package services

import (
	"github.com/noreng-jg/bastion-machine/server/models"
)

type Session struct {
	spec *models.SSHSpec
}

func NewSession(spec *models.SSHSpec) *Session {
	return &Session{spec: spec}
}
