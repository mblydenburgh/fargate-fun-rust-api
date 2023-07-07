# !/usr/bin/env bash

docker build --build-arg LOCAL=true --tag fargate-fun-rust --file DockerfileLocal .
