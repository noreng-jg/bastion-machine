package main

import (
	"github.com/kelseyhightower/envconfig"
	"log"
	"net/http"

	"github.com/noreng-jg/bastion-machine/server/models"
	"github.com/noreng-jg/bastion-machine/server/routes"
	svc "github.com/noreng-jg/bastion-machine/server/services"
)

func main() {
	var spec models.SSHSpec
	if err := envconfig.Process("server", &spec); err != nil {
		return
	}

	session := svc.NewSession(&spec)
	h := routes.NewHandler(session)

	http.HandleFunc("/ws", h.Connect)

	log.Fatal(http.ListenAndServe(":2224", nil))
}
