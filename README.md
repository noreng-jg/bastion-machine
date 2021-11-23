# Bastion machine

A simple SSH server project for concept validation usage of web terminal resizing through websocket connection.

## Requirements

1. openssh-server on port 22

## Authentications details

For now, only the password authentication is supported

## Procedures

Fill your credentials for the dotenv override file by copying the one from root:

```
cp .env .env.override
```

and editing their contents to your ssh credentials.

Run:

```
./bin/docker-compose build && ./bin/docker-compose up
```

Open browser on [http://localhost:3000](http://localhost:3000)`.

![alt text](https://github.com/noreng-jg/bastion-machine/blob/main/imgs/web-img.png?raw=true)

## References

- [ssh-connection](https://tech.mojotv.cn/2019/05/22/golang-ssh-session)
