# CI/CD Pipeline Strategy

## Overview

Automated deployment pipeline using GitHub Actions to deploy CDK infrastructure and Express API across multiple environments.

## Pipeline Architecture

```
Git Push → GitHub Actions → Build → Test → CDK Deploy → App Deploy → Verification
```

## Environment Strategy

| Branch | Environment | Auto-Deploy | Approval Required |
|--------|-------------|-------------|-------------------|
| `develop` | Development | ✅ Yes | ❌ No |
| `staging` | Staging | ✅ Yes | ❌ No |
| `main` | Production | ✅ Yes | ✅ Yes (manual) |

## GitHub Actions Workflows

### 1. Main Deployment Workflow

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to AWS

on:
  push:
    branches:
      - main
      - staging
      - develop
  pull_request:
    branches:
      - main
      - staging

env:
  AWS_REGION: us-east-1
  NODE_VERSION: '20'

jobs:
  # Job 1: Determine environment
  setup:
    runs-on: ubuntu-latest
    outputs:
      environment: ${{ steps.set-env.outputs.environment }}
      deploy: ${{ steps.set-env.outputs.deploy }}
    steps:
      - name: Determine environment
        id: set-env
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "environment=production" >> $GITHUB_OUTPUT
            echo "deploy=true" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == "refs/heads/staging" ]]; then
            echo "environment=staging" >> $GITHUB_OUTPUT
            echo "deploy=true" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == "refs/heads/develop" ]]; then
            echo "environment=development" >> $GITHUB_OUTPUT
            echo "deploy=true" >> $GITHUB_OUTPUT
          else
            echo "environment=none" >> $GITHUB_OUTPUT
            echo "deploy=false" >> $GITHUB_OUTPUT
          fi

  # Job 2: Build and test
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd express-api
          npm ci

      - name: Lint code
        run: |
          cd express-api
          npm run lint

      - name: Run unit tests
        run: |
          cd express-api
          npm run test:unit

      - name: Run integration tests
        run: |
          cd express-api
          npm run test:integration

      - name: Build TypeScript
        run: |
          cd express-api
          npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: api-build
          path: express-api/dist

  # Job 3: Security scanning
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: test
          args: --severity-threshold=high

      - name: Build Docker image
        run: |
          cd express-api
          docker build -t express-api:${{ github.sha }} .

      - name: Scan Docker image with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: express-api:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  # Job 4: CDK diff (on PRs)
  cdk-diff:
    runs-on: ubuntu-latest
    needs: [setup]
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Install CDK dependencies
        run: |
          cd cdk-infrastructure
          npm ci

      - name: CDK synth
        run: |
          cd cdk-infrastructure
          npx cdk synth

      - name: CDK diff
        id: cdk-diff
        run: |
          cd cdk-infrastructure
          npx cdk diff --all > diff.txt || true
          cat diff.txt

      - name: Comment PR with CDK diff
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const diff = fs.readFileSync('cdk-infrastructure/diff.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## CDK Diff\n\`\`\`\n${diff}\n\`\`\``
            });

  # Job 5: Deploy infrastructure
  deploy-infrastructure:
    runs-on: ubuntu-latest
    needs: [setup, build-and-test, security-scan]
    if: needs.setup.outputs.deploy == 'true'
    environment: ${{ needs.setup.outputs.environment }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Install CDK dependencies
        run: |
          cd cdk-infrastructure
          npm ci

      - name: CDK bootstrap (if needed)
        run: |
          cd cdk-infrastructure
          npx cdk bootstrap aws://${{ secrets.AWS_ACCOUNT_ID }}/${{ env.AWS_REGION }}

      - name: Deploy NetworkStack
        run: |
          cd cdk-infrastructure
          npx cdk deploy NetworkStack-${{ needs.setup.outputs.environment }} --require-approval never

      - name: Deploy DatabaseStack and QueueStack
        run: |
          cd cdk-infrastructure
          npx cdk deploy DatabaseStack-${{ needs.setup.outputs.environment }} QueueStack-${{ needs.setup.outputs.environment }} --require-approval never

      - name: Deploy ApiStack and WorkerStack
        run: |
          cd cdk-infrastructure
          npx cdk deploy ApiStack-${{ needs.setup.outputs.environment }} WorkerStack-${{ needs.setup.outputs.environment }} --require-approval never

      - name: Get stack outputs
        id: stack-outputs
        run: |
          cd cdk-infrastructure
          echo "ecr_repo=$(aws cloudformation describe-stacks --stack-name ApiStack-${{ needs.setup.outputs.environment }} --query 'Stacks[0].Outputs[?OutputKey==`EcrRepositoryUri`].OutputValue' --output text)" >> $GITHUB_OUTPUT
          echo "cluster_name=$(aws cloudformation describe-stacks --stack-name ApiStack-${{ needs.setup.outputs.environment }} --query 'Stacks[0].Outputs[?OutputKey==`ClusterName`].OutputValue' --output text)" >> $GITHUB_OUTPUT
          echo "service_name=$(aws cloudformation describe-stacks --stack-name ApiStack-${{ needs.setup.outputs.environment }} --query 'Stacks[0].Outputs[?OutputKey==`ServiceName`].OutputValue' --output text)" >> $GITHUB_OUTPUT

    outputs:
      ecr-repo: ${{ steps.stack-outputs.outputs.ecr_repo }}
      cluster-name: ${{ steps.stack-outputs.outputs.cluster_name }}
      service-name: ${{ steps.stack-outputs.outputs.service_name }}

  # Job 6: Build and push Docker image
  build-and-push-image:
    runs-on: ubuntu-latest
    needs: [setup, deploy-infrastructure]
    if: needs.setup.outputs.deploy == 'true'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and tag Docker image
        run: |
          cd express-api
          docker build -t ${{ needs.deploy-infrastructure.outputs.ecr-repo }}:${{ github.sha }} .
          docker tag ${{ needs.deploy-infrastructure.outputs.ecr-repo }}:${{ github.sha }} ${{ needs.deploy-infrastructure.outputs.ecr-repo }}:latest

      - name: Push Docker image to ECR
        run: |
          docker push ${{ needs.deploy-infrastructure.outputs.ecr-repo }}:${{ github.sha }}
          docker push ${{ needs.deploy-infrastructure.outputs.ecr-repo }}:latest

  # Job 7: Run database migrations
  run-migrations:
    runs-on: ubuntu-latest
    needs: [setup, deploy-infrastructure, build-and-push-image]
    if: needs.setup.outputs.deploy == 'true'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Get database credentials from Secrets Manager
        id: db-secret
        run: |
          SECRET=$(aws secretsmanager get-secret-value --secret-id db-credentials-${{ needs.setup.outputs.environment }} --query SecretString --output text)
          echo "::add-mask::$SECRET"
          echo "database_url=$(echo $SECRET | jq -r '.url')" >> $GITHUB_OUTPUT

      - name: Install dependencies
        run: |
          cd express-api
          npm ci

      - name: Run Prisma migrations
        env:
          DATABASE_URL: ${{ steps.db-secret.outputs.database_url }}
        run: |
          cd express-api
          npx prisma migrate deploy

  # Job 8: Deploy application
  deploy-application:
    runs-on: ubuntu-latest
    needs: [setup, deploy-infrastructure, build-and-push-image, run-migrations]
    if: needs.setup.outputs.deploy == 'true'
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Update Fargate service
        run: |
          aws ecs update-service \
            --cluster ${{ needs.deploy-infrastructure.outputs.cluster-name }} \
            --service ${{ needs.deploy-infrastructure.outputs.service-name }} \
            --force-new-deployment

      - name: Wait for service to stabilize
        run: |
          aws ecs wait services-stable \
            --cluster ${{ needs.deploy-infrastructure.outputs.cluster-name }} \
            --services ${{ needs.deploy-infrastructure.outputs.service-name }}

  # Job 9: Deploy Lambda functions
  deploy-lambda:
    runs-on: ubuntu-latest
    needs: [setup, deploy-infrastructure, run-migrations]
    if: needs.setup.outputs.deploy == 'true'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Install Lambda dependencies
        run: |
          cd lambda-workers
          npm ci --production

      - name: Package Lambda function
        run: |
          cd lambda-workers
          zip -r notification-processor.zip .

      - name: Get Lambda function name
        id: lambda-name
        run: |
          FUNCTION_NAME=$(aws cloudformation describe-stacks \
            --stack-name WorkerStack-${{ needs.setup.outputs.environment }} \
            --query 'Stacks[0].Outputs[?OutputKey==`NotificationProcessorFunctionName`].OutputValue' \
            --output text)
          echo "function_name=$FUNCTION_NAME" >> $GITHUB_OUTPUT

      - name: Update Lambda function code
        run: |
          cd lambda-workers
          aws lambda update-function-code \
            --function-name ${{ steps.lambda-name.outputs.function_name }} \
            --zip-file fileb://notification-processor.zip

      - name: Wait for Lambda update to complete
        run: |
          aws lambda wait function-updated \
            --function-name ${{ steps.lambda-name.outputs.function_name }}

  # Job 10: Post-deployment verification
  verify-deployment:
    runs-on: ubuntu-latest
    needs: [setup, deploy-application, deploy-lambda]
    if: needs.setup.outputs.deploy == 'true'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Get ALB URL
        id: alb-url
        run: |
          ALB_URL=$(aws cloudformation describe-stacks \
            --stack-name ApiStack-${{ needs.setup.outputs.environment }} \
            --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerUrl`].OutputValue' \
            --output text)
          echo "url=$ALB_URL" >> $GITHUB_OUTPUT

      - name: Health check
        run: |
          sleep 30  # Wait for DNS propagation
          response=$(curl -s -o /dev/null -w "%{http_code}" http://${{ steps.alb-url.outputs.url }}/health)
          if [ "$response" != "200" ]; then
            echo "Health check failed with status: $response"
            exit 1
          fi
          echo "Health check passed!"

      - name: Run smoke tests
        run: |
          # Add your smoke tests here
          echo "Running smoke tests against http://${{ steps.alb-url.outputs.url }}"
          # Example: npm run test:e2e

      - name: Notify team (Slack/Discord)
        if: always()
        run: |
          # Add notification logic here
          echo "Deployment to ${{ needs.setup.outputs.environment }} completed"
```

### 2. PR Validation Workflow

**File**: `.github/workflows/pr-validation.yml`

```yaml
name: PR Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd express-api
          npm ci

      - name: Check code formatting
        run: |
          cd express-api
          npm run format:check

      - name: Lint
        run: |
          cd express-api
          npm run lint

      - name: Type check
        run: |
          cd express-api
          npm run type-check

      - name: Run tests with coverage
        run: |
          cd express-api
          npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./express-api/coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Comment PR with coverage
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./express-api/coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 3. Rollback Workflow

**File**: `.github/workflows/rollback.yml`

```yaml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
      target_sha:
        description: 'Git SHA to rollback to'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - name: Checkout target commit
        uses: actions/checkout@v4
        with:
          ref: ${{ inputs.target_sha }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Get previous image
        id: previous-image
        run: |
          IMAGE_URI=$(aws ecr describe-images \
            --repository-name express-api-${{ inputs.environment }} \
            --image-ids imageTag=${{ inputs.target_sha }} \
            --query 'imageDetails[0].imageTags[0]' \
            --output text)
          echo "image=$IMAGE_URI" >> $GITHUB_OUTPUT

      - name: Update ECS service with previous image
        run: |
          # Get current task definition
          TASK_DEF=$(aws ecs describe-task-definition \
            --task-definition express-api-${{ inputs.environment }} \
            --query 'taskDefinition')

          # Create new task definition with old image
          NEW_TASK_DEF=$(echo $TASK_DEF | jq \
            --arg IMAGE "${{ steps.previous-image.outputs.image }}" \
            '.containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')

          # Register new task definition
          aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEF"

          # Update service
          aws ecs update-service \
            --cluster api-cluster-${{ inputs.environment }} \
            --service express-api-${{ inputs.environment }} \
            --task-definition express-api-${{ inputs.environment }}

      - name: Notify team
        run: |
          echo "Rolled back ${{ inputs.environment }} to ${{ inputs.target_sha }}"
```

## AWS Setup Requirements

### 1. AWS OIDC Provider (Recommended)

More secure than long-lived access keys:

```bash
# Create OIDC provider for GitHub Actions
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 2. IAM Role for GitHub Actions

**Trust Policy** (`github-actions-trust-policy.json`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:*"
        }
      }
    }
  ]
}
```

**Permissions**:
- CloudFormation full access
- ECR push/pull
- ECS update service
- Lambda update code
- Secrets Manager read
- S3 (for CDK assets)

### 3. GitHub Secrets

Required secrets in repository settings:

```
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/github-actions-deploy
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1
SNYK_TOKEN=your-snyk-token (optional)
```

## Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Git Push                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Build & Test (parallel)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐              │
│  │   Lint   │  │   Test   │  │   Security   │              │
│  └──────────┘  └──────────┘  │     Scan     │              │
│                               └──────────────┘              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Deploy Infrastructure                      │
│                  (CDK Stacks in order)                       │
│                                                              │
│  1. NetworkStack                                            │
│  2. DatabaseStack + QueueStack (parallel)                   │
│  3. ApiStack + WorkerStack (parallel)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Build & Push Docker Image to ECR                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Run Database Migrations                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           Deploy Application (parallel)                      │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │  Update Fargate    │  │  Update Lambda     │            │
│  │     Service        │  │    Functions       │            │
│  └────────────────────┘  └────────────────────┘            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Post-Deployment Verification                 │
│                                                              │
│  • Health checks                                            │
│  • Smoke tests                                              │
│  • Notify team                                              │
└─────────────────────────────────────────────────────────────┘
```

## Monitoring & Observability

### CloudWatch Alarms in CDK

Add to your CDK stacks:

```typescript
// API Error Rate Alarm
new cloudwatch.Alarm(this, 'ApiErrorRateAlarm', {
  metric: targetGroup.metricTargetResponseTime(),
  threshold: 1000, // ms
  evaluationPeriods: 2,
  alarmDescription: 'API response time is high',
});

// Lambda Error Alarm
new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
  metric: lambdaFunction.metricErrors(),
  threshold: 10,
  evaluationPeriods: 2,
});

// Queue Depth Alarm
new cloudwatch.Alarm(this, 'QueueDepthAlarm', {
  metric: queue.metricApproximateNumberOfMessagesVisible(),
  threshold: 1000,
  evaluationPeriods: 2,
});
```

### Deployment Notifications

Add to workflow:

```yaml
- name: Send Slack notification
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployment to ${{ needs.setup.outputs.environment }}",
        "status": "${{ job.status }}",
        "commit": "${{ github.sha }}",
        "author": "${{ github.actor }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

1. **Immutable Deployments**
   - Never modify running containers
   - Always deploy new versions
   - Tag images with Git SHA

2. **Database Migrations**
   - Run before code deployment
   - Make migrations backward-compatible
   - Test rollback scenarios

3. **Secrets Management**
   - Never commit secrets
   - Use AWS Secrets Manager
   - Rotate credentials regularly

4. **Monitoring**
   - Set up alarms before going to production
   - Monitor key metrics (latency, errors, throughput)
   - Have runbooks for common issues

5. **Rollback Strategy**
   - Keep previous versions available
   - Automate rollback process
   - Test rollback regularly

6. **Cost Optimization**
   - Destroy dev environments at night
   - Use spot instances for non-critical workloads
   - Monitor AWS costs with budgets/alarms

## Local Testing of CI/CD

Use `act` to test GitHub Actions locally:

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act push -j build-and-test

# Run with secrets
act push -j build-and-test --secret-file .secrets
```

## Troubleshooting Common Issues

### Issue: CDK Bootstrap Fails
```bash
# Manually bootstrap
npx cdk bootstrap aws://ACCOUNT_ID/REGION
```

### Issue: ECR Push Permission Denied
```bash
# Verify IAM role has ECR permissions
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### Issue: ECS Service Won't Stabilize
```bash
# Check task logs
aws logs tail /ecs/express-api --follow

# Check task definition
aws ecs describe-tasks --cluster CLUSTER --tasks TASK_ID
```

### Issue: Lambda Update Fails
```bash
# Check function logs
aws logs tail /aws/lambda/FUNCTION_NAME --follow

# Verify package size < 50MB
ls -lh notification-processor.zip
```
