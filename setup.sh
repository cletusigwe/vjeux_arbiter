#!/bin/sh

set -xe

export NODE_EXTRA_CA_CERTS=certificates/root_certificates/RootCA.crt
npm set strict-ssl false
# npm install