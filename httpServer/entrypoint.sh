#!/bin/bash
#always make sure this file uses linux line endings otherwise you will get https://forums.docker.com/t/standard-init-linux-go-175-exec-user-process-caused-no-such-file/20025

echo "Wait for mongod to be available"
until [ -f /pid/mongod.pid ]
do
     sleep 5
done
echo "PID File found"

exec "$@"