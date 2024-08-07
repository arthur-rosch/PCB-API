#!/bin/sh
set -e

echo "Starting SSH ..."
/usr/sbin/sshd

npm run start