package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"sync"
	"time"

	ws "github.com/gorilla/websocket"
	"github.com/noreng-jg/bastion-machine/server/models"
	"golang.org/x/crypto/ssh"
)

const (
	TypeCommand = "cmd"
	TypeResize  = "resize"
)

type WebsocketMessage struct {
	Type    string `json:"type"`
	Command string `json:"command"`
	Rows    int    `json:"rows"`
	Cols    int    `json:"cols"`
}

type StdOutBuffer struct {
	buffer bytes.Buffer
	mutex  sync.Mutex
}

func (sb *StdOutBuffer) Write(b []byte) (int, error) {
	/*
	   Avoid concurrency issues when filling the buffer
	*/
	sb.mutex.Lock()
	defer sb.mutex.Unlock()
	return sb.buffer.Write(b)
}

type Sizes struct {
	Cols int `json:"cols"`
	Rows int `json:"rows"`
}

type SshPipes struct {
	Stdin   io.WriteCloser
	Stdout  *StdOutBuffer
	Session *ssh.Session
}

func GenPipes(sz *Sizes, clientSSH *ssh.Client) (*SshPipes, error) {
	sshSession, err := clientSSH.NewSession()
	if err != nil {
		log.Println("debugging GenPipes - 1")
		log.Println(err)
		return nil, err
	}

	stdinPipe, err := sshSession.StdinPipe()
	if err != nil {
		log.Println(err)
		log.Println("debugging GenPipes - 2")
		return nil, err
	}

	outBufferWriter := new(StdOutBuffer)

	sshSession.Stdout = outBufferWriter
	sshSession.Stderr = outBufferWriter

	if err := sshSession.RequestPty("xterm", sz.Rows, sz.Cols, ssh.TerminalModes{
		ssh.ECHO:          1,
		ssh.TTY_OP_ISPEED: 14400,
		ssh.TTY_OP_OSPEED: 14400,
	}); err != nil {
		log.Println(err)
		log.Println("debugging GenPipes - 3")
		return nil, err
	}

	if err := sshSession.Shell(); err != nil {
		log.Println("debugging GenPipes - 4")
		log.Println(err)
		return nil, err
	}

	return &SshPipes{Stdin: stdinPipe, Stdout: outBufferWriter, Session: sshSession}, nil
}

func (s *Session) StartSSHSession(conn *models.Connection, wsConn *ws.Conn) {
	username := conn.Username
	password := conn.Password

	if conn.Username == "" {
		username = s.spec.User
	}

	if conn.Password == "" {
		password = s.spec.Password
	}

	fmt.Println(username, password)

	// for now only handling password authentication
	config := &ssh.ClientConfig{
		User:            username,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Auth:            []ssh.AuthMethod{ssh.Password(password)},
	}

	defer wsConn.Close()

	addr := fmt.Sprintf("%s:%d", s.spec.Host, s.spec.Port)

	clientSSH, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		log.Println(err)
		log.Println("debugging StartSSHSession - 1")
		return
	}

	defer clientSSH.Close()

	// initialize pipes for the ssh connection
	pipes, err := GenPipes(&Sizes{Cols: conn.Cols, Rows: conn.Rows}, clientSSH)
	if err != nil {
		log.Println(err)
		log.Println("debugging StartSSHSession - 2")
		return
	}

	defer pipes.Session.Close()

	chQ := make(chan bool, 3)

	buff := new(bytes.Buffer)

	go pipes.PumpStdin(wsConn, buff, chQ)
	go pipes.PumpStdout(wsConn, chQ)
	go pipes.Wait(chQ)

	<-chQ
}

func (p *SshPipes) PumpStdout(wsConn *ws.Conn, ch chan bool) {
	/*
	   Send output back to client according to interval addopted
	*/

	defer func() {
		ch <- true
	}()

	tick := time.NewTicker(time.Millisecond * time.Duration(100))

	defer tick.Stop()
	for {
		select {
		case <-tick.C: // write each tick ping
			if p.Stdout.buffer.Len() != 0 {
				err := wsConn.WriteMessage(ws.TextMessage, p.Stdout.buffer.Bytes())
				if err != nil {
					log.Println("debugging PumpStdout - 1")
					log.Println(err)
				}
				p.Stdout.buffer.Reset()
			}
		case <-ch:
			log.Println("debugging PumpStdout - 2")
			return
		}
	}

}

func (p *SshPipes) Wait(ch chan bool) {
	if err := p.Session.Wait(); err != nil {
		log.Println(err)
		log.Println("debugging Wait")
		return
	}
}

func (p *SshPipes) PumpStdin(wsConn *ws.Conn, buffer *bytes.Buffer, ch chan bool) {
	/*
	   Listen for incoming messages that comes from websocket data
	   redirecting the data to stdin pipeline
	*/

	defer func() {
		ch <- true
	}()

	for {
		log.Println("debugging PumpStdin - 1")
		select {
		case <-ch:
			log.Println("debugging PumpStdin - 2")
			return
		default:
			_, data, err := wsConn.ReadMessage()
			if err != nil {
				log.Println(err)
				log.Println(data)
				log.Println("debugging PumpStdin - 3")
				return
			}

			// decode data connection struct
			msgStr := WebsocketMessage{}
			log.Println("debugging PumpStdin - 4")
			if err := json.Unmarshal(data, &msgStr); err != nil {
				log.Println("debugging PumpStdin - 5")
				log.Println(err)
			}

			switch msgStr.Type {
			case TypeCommand:
				log.Println("command-type: debugging PumpStdin - 6")

				rBytes := []byte(msgStr.Command)

				if _, err := p.Stdin.Write(rBytes); err != nil {
					log.Println("debugging PumpStdin - 8")
					log.Println(err)
				}

				if _, err := buffer.Write(rBytes); err != nil {
					log.Println("debugging PumpStdin - 9")
					log.Println(err)
				}
			case TypeResize:
				log.Println("resize-type: debugging PumpStdin - 10")
				if err := p.Session.WindowChange(msgStr.Rows, msgStr.Cols); err != nil {
					log.Println(err)
				}
			}
		}
	}
}
