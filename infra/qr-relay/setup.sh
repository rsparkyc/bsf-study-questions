#!/bin/bash
# Creates the QR login relay: DynamoDB table, IAM role, Lambda, function URL.
# Touches only new resources named bsf-qr-login / bsfQrRelay*. Prints the URL.
set -euo pipefail
export AWS_PROFILE=casker AWS_REGION=us-east-1
cd "$(dirname "$0")"
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

aws dynamodb create-table --table-name bsf-qr-login \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --output text --query TableDescription.TableName
aws dynamodb wait table-exists --table-name bsf-qr-login
aws dynamodb update-time-to-live --table-name bsf-qr-login \
  --time-to-live-specification Enabled=true,AttributeName=ttl --output text

aws iam create-role --role-name bsfQrRelay-role --output text --query Role.Arn \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam attach-role-policy --role-name bsfQrRelay-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam put-role-policy --role-name bsfQrRelay-role --policy-name table \
  --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"dynamodb:PutItem\",\"dynamodb:DeleteItem\"],\"Resource\":\"arn:aws:dynamodb:us-east-1:$ACCOUNT:table/bsf-qr-login\"}]}"
sleep 10 # IAM propagation

ZIP=$(mktemp -d)/relay.zip
zip -q "$ZIP" index.mjs
aws lambda create-function --function-name bsfQrRelay --runtime nodejs22.x \
  --architectures arm64 --memory-size 256 --timeout 5 --handler index.handler \
  --role "arn:aws:iam::$ACCOUNT:role/bsfQrRelay-role" --zip-file "fileb://$ZIP" \
  --environment 'Variables={TABLE=bsf-qr-login}' --output text --query FunctionName
aws lambda wait function-active --function-name bsfQrRelay
aws lambda add-permission --function-name bsfQrRelay --statement-id url \
  --action lambda:InvokeFunctionUrl --principal '*' --function-url-auth-type NONE --output text >/dev/null
aws lambda add-permission --function-name bsfQrRelay --statement-id invoke \
  --action lambda:InvokeFunction --principal '*' --output text >/dev/null
aws lambda create-function-url-config --function-name bsfQrRelay --auth-type NONE \
  --cors '{"AllowOrigins":["https://bsfapp.ryancaskey.com","http://localhost:3000"],"AllowMethods":["GET","PUT"],"AllowHeaders":["content-type"],"MaxAge":3600}' \
  --output text --query FunctionUrl
