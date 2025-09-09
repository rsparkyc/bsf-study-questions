#!/bin/bash

# BSF Study Questions Deployment Script
# This script builds the React app and deploys it to AWS S3 with CloudFront invalidation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Update these values for your setup
BUCKET_NAME=""  # Will be auto-detected or set manually
CLOUDFRONT_DISTRIBUTION_ID=""  # Will be auto-detected or set manually
AWS_PROFILE="staticWebsites"  # Your AWS profile name

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Load configuration from deploy.config if it exists
if [ -f "deploy.config" ]; then
    source deploy.config
    print_info "Loaded configuration from deploy.config"
fi

echo -e "${BLUE}🚀 Starting BSF Study Questions Deployment${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity --profile $AWS_PROFILE &> /dev/null; then
    print_error "AWS credentials not configured or expired for profile '$AWS_PROFILE'"
    print_info "Please run: aws sso login --profile $AWS_PROFILE"
    exit 1
fi

print_status "AWS credentials verified"

# Auto-detect S3 bucket if not set
if [ -z "$BUCKET_NAME" ]; then
    print_info "Auto-detecting S3 bucket..."

    # Look for buckets that might contain static websites
    BUCKETS=$(aws s3 ls --profile $AWS_PROFILE | grep -E "(static|website|bsf)" | awk '{print $3}')

    if [ -z "$BUCKETS" ]; then
        print_warning "No obvious static website buckets found. Available buckets:"
        aws s3 ls --profile $AWS_PROFILE
        echo ""
        read -p "Enter the S3 bucket name for your static website: " BUCKET_NAME
    else
        echo "Found potential buckets:"
        echo "$BUCKETS"
        echo ""
        read -p "Enter the S3 bucket name (or press Enter to use the first one): " USER_BUCKET

        if [ -z "$USER_BUCKET" ]; then
            BUCKET_NAME=$(echo "$BUCKETS" | head -n1)
        else
            BUCKET_NAME="$USER_BUCKET"
        fi
    fi
fi

print_status "Using S3 bucket: $BUCKET_NAME"

# Auto-detect CloudFront distribution if not set
if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_info "Auto-detecting CloudFront distribution..."

    # Get distributions and look for ones that might be associated with our bucket
    DISTRIBUTIONS=$(aws cloudfront list-distributions --profile $AWS_PROFILE --query 'DistributionList.Items[?Origins.Items[0].DomainName==`'$BUCKET_NAME'.s3.amazonaws.com` || Origins.Items[0].DomainName==`'$BUCKET_NAME'.s3-website-us-east-1.amazonaws.com`].{Id:Id,Comment:Comment,Status:Status}' --output table 2>/dev/null || echo "")

    if [ -z "$DISTRIBUTIONS" ] || [ "$DISTRIBUTIONS" = "None" ]; then
        print_warning "No CloudFront distribution found for bucket '$BUCKET_NAME'"
        print_info "Available distributions:"
        aws cloudfront list-distributions --profile $AWS_PROFILE --query 'DistributionList.Items[].{Id:Id,Comment:Comment,Status:Status}' --output table
        echo ""
        read -p "Enter CloudFront distribution ID (or press Enter to skip invalidation): " CLOUDFRONT_DISTRIBUTION_ID
    else
        echo "Found potential distributions:"
        echo "$DISTRIBUTIONS"
        echo ""
        read -p "Enter CloudFront distribution ID (or press Enter to use the first one): " USER_DISTRIBUTION

        if [ -z "$USER_DISTRIBUTION" ]; then
            CLOUDFRONT_DISTRIBUTION_ID=$(echo "$DISTRIBUTIONS" | grep -E "^\| [a-zA-Z0-9]+" | head -n1 | awk '{print $3}')
        else
            CLOUDFRONT_DISTRIBUTION_ID="$USER_DISTRIBUTION"
        fi
    fi
fi

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_status "Using CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID"
else
    print_warning "No CloudFront distribution specified - skipping invalidation"
fi

# Build the React app
print_info "Building React application..."
npm run build

if [ ! -d "build" ]; then
    print_error "Build directory not found. Build may have failed."
    exit 1
fi

print_status "Build completed successfully"

# Sync to S3
print_info "Syncing files to S3 bucket '$BUCKET_NAME'..."

# Use --delete to remove old files, --exact-timestamps for better caching
aws s3 sync build/ s3://$BUCKET_NAME/ \
    --profile $AWS_PROFILE \
    --delete \
    --exact-timestamps \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "*.json"

# Upload HTML and JSON files with shorter cache times
aws s3 sync build/ s3://$BUCKET_NAME/ \
    --profile $AWS_PROFILE \
    --exact-timestamps \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "*.json"

print_status "Files synced to S3"

# Invalidate CloudFront cache
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_info "Invalidating CloudFront cache..."

    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --profile $AWS_PROFILE \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)

    print_status "CloudFront invalidation created: $INVALIDATION_ID"
    print_info "Cache invalidation is in progress. It may take 5-15 minutes to complete."
else
    print_warning "Skipping CloudFront invalidation"
fi

# Get the website URL
print_info "Getting website URL..."
WEBSITE_URL=$(aws s3api get-bucket-website --profile $AWS_PROFILE --bucket $BUCKET_NAME --query 'WebsiteConfiguration.IndexDocument.Suffix' --output text 2>/dev/null || echo "")

if [ -n "$WEBSITE_URL" ] && [ "$WEBSITE_URL" != "None" ]; then
    WEBSITE_URL="http://$BUCKET_NAME.s3-website-$(aws s3api get-bucket-location --profile $AWS_PROFILE --bucket $BUCKET_NAME --query 'LocationConstraint' --output text | sed 's/None/us-east-1/').amazonaws.com"
    print_status "Website URL: $WEBSITE_URL"
else
    print_info "S3 website hosting not configured. You may need to access via CloudFront or configure website hosting."
fi

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    CLOUDFRONT_URL=$(aws cloudfront get-distribution --profile $AWS_PROFILE --id $CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)
    print_status "CloudFront URL: https://$CLOUDFRONT_URL"
fi

echo ""
print_status "🎉 Deployment completed successfully!"
print_info "Your BSF Study Questions app has been deployed with the latest changes."

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_warning "Note: CloudFront cache invalidation is in progress. Changes may take 5-15 minutes to be visible."
fi
