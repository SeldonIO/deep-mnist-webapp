#!/bin/bash

set -o nounset
set -o errexit

HOST=$1
KEY=$2
SECRET=$3

python /home/seldon/webapp.py --host ${HOST} --key ${KEY} --secret ${SECRET}
