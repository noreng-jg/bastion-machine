FROM golang:1.17.2-alpine3.14 AS development

# hot reload
RUN go install github.com/markbates/refresh@v1.11.1 && \
    apk add --update openssh-client	

# in root download copy deps and download it
WORKDIR $GOPATH/src/github.com/noreng-jg/bastion-machine

COPY ./go.mod ./

RUN go mod download

# in server copy dependecy files, the folder itself, build and execure entrypoint
WORKDIR $GOPATH/src/github.com/noreng-jg/bastion-machine/server

COPY ./server/go.mod ./server/go.sum ./

RUN go mod download

COPY ./server .

RUN go build

ENTRYPOINT ["./entrypoint.sh"]
