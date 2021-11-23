package routes

import (
	"log"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gorilla/websocket"
	"github.com/noreng-jg/bastion-machine/server/models"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024 * 1024 * 1,
}

func (h *Handler) Connect(w http.ResponseWriter, r *http.Request) {
	u, err := url.Parse(r.RequestURI)
	if err != nil {
		return
	}

	queryParams := u.Query()

	username := queryParams["user"]
	password := queryParams["password"]
	rows := queryParams["rows"]
	cols := queryParams["cols"]

	if len(username) == 0 || len(password) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// upgrade websocket protocol
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	h.session.StartSSHSession(&models.Connection{
		Username: username[0],
		Password: password[0],
		Cols: func() int {
			n, _ := strconv.Atoi(cols[0])
			return n
		}(),
		Rows: func() int {
			n, _ := strconv.Atoi(rows[0])
			return n
		}(),
	}, conn)

	return
}
