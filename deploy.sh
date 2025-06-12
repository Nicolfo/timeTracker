#!/bin/bash

helm upgrade --install time-tracker ./time-tracker --namespace time-tracker --create-namespace --values ./time-tracker/values-secret.yaml