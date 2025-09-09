# BSF Study Questions - Deployment Guide

This guide explains how to deploy the BSF Study Questions application to AWS S3 with CloudFront.

## Prerequisites

1. **AWS CLI installed and configured**

    ```bash
    # Install AWS CLI (if not already installed)
    brew install awscli  # macOS
    # or download from https://aws.amazon.com/cli/

    # Configure your AWS profile
    aws configure --profile staticWebsites
    ```

2. **AWS SSO Login** (if using SSO)

    ```bash
    aws sso login --profile staticWebsites
    ```

3. **Node.js and npm** (for building the React app)

## Quick Deployment

The easiest way to deploy is using the npm script:

```bash
npm run deploy
```

This will:

1. Build the React application
2. Auto-detect your S3 bucket and CloudFront distribution
3. Sync files to S3 with proper caching headers
4. Invalidate CloudFront cache
5. Display the website URLs

## Manual Deployment

If you prefer to run the deployment script directly:

```bash
./deploy.sh
```

## Configuration

### Auto-Detection (Recommended)

The deployment script will automatically detect:

-   S3 buckets that contain "static", "website", or "bsf" in the name
-   CloudFront distributions associated with your S3 bucket

### Manual Configuration

1. Copy the example configuration:

    ```bash
    cp deploy.config.example deploy.config
    ```

2. Edit `deploy.config` with your specific values:

    ```bash
    AWS_PROFILE=staticWebsites
    BUCKET_NAME=your-bucket-name
    CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
    ```

3. Run deployment:
    ```bash
    ./deploy.sh
    ```

## What the Deployment Does

### Build Process

-   Runs `npm run build` to create optimized production files
-   Outputs to the `build/` directory

### S3 Sync

-   Syncs all files from `build/` to your S3 bucket
-   Sets appropriate cache headers:
    -   Static assets (JS, CSS, images): 1 year cache
    -   HTML and JSON files: No cache (always fresh)
-   Removes old files that are no longer needed

### CloudFront Invalidation

-   Creates a cache invalidation for all files (`/*`)
-   Ensures users get the latest version immediately
-   Invalidation typically takes 5-15 minutes to complete

## Troubleshooting

### AWS Credentials Issues

```bash
# Check if credentials are working
aws sts get-caller-identity --profile staticWebsites

# If using SSO, re-login
aws sso login --profile staticWebsites
```

### Bucket Not Found

-   Make sure your S3 bucket exists
-   Verify you have the correct AWS profile selected
-   Check bucket permissions

### CloudFront Issues

-   Verify the distribution ID is correct
-   Check that the distribution is associated with your S3 bucket
-   Ensure you have permission to create invalidations

### Build Failures

-   Run `npm install` to ensure all dependencies are installed
-   Check for TypeScript or linting errors
-   Verify the build works locally: `npm run build`

## File Structure After Deployment

```
S3 Bucket/
├── index.html (no cache)
├── static/
│   ├── css/
│   │   └── main.[hash].css (1 year cache)
│   └── js/
│       ├── main.[hash].js (1 year cache)
│       └── [chunk].[hash].js (1 year cache)
├── favicon.ico (1 year cache)
├── manifest.json (no cache)
└── robots.txt (1 year cache)
```

## Recent Changes

The deployment script automatically deploys the latest version of your application with all current changes from your git repository.

## Support

If you encounter issues with deployment:

1. Check the error messages in the terminal
2. Verify your AWS credentials and permissions
3. Ensure your S3 bucket and CloudFront distribution are properly configured
4. Check the AWS CloudWatch logs for any service-specific errors
