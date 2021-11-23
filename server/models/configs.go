package models

type SSHSpec struct {
	Host     string `envconfig:"ssh_host"`
	Password string `envconfig:"ssh_password"`
	Port     int    `envconfig:"ssh_port"`
	Type     string `envconfig:"ssh_type" default:"password"`
	User     string `envconfig:"ssh_user"`
}
