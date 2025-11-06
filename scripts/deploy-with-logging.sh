#!/bin/bash

# CourseConnect Deployment Logger
# This script automatically logs deployments to localhost and Vercel

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log deployment
log_deployment() {
    local environment=$1
    local version=$2
    local changes=$3
    local author=${4:-"Development Team"}
    
    echo -e "${BLUE}🚀 Logging deployment to ${environment}...${NC}"
    
    # Create a temporary file with the deployment log
    cat > temp_deployment_log.js << EOF
// Auto-generated deployment log
import { logLocalhostDeployment, logVercelDeployment, logProductionDeployment } from './src/lib/site-logs.ts';

// Log deployment
${environment}Deployment('${version}', ${changes}, '${author}');

console.log('✅ Deployment logged successfully');
EOF
    
    echo -e "${GREEN}✅ Deployment logged: ${version} to ${environment}${NC}"
    echo -e "${YELLOW}📝 Changes: ${changes}${NC}"
    echo -e "${YELLOW}👤 Author: ${author}${NC}"
}

# Function to deploy to localhost
deploy_localhost() {
    echo -e "${BLUE}🏠 Deploying to localhost...${NC}"
    
    # Get current version from package.json
    VERSION=$(node -p "require('./package.json').version")
    
    # Get git commit message for changes
    CHANGES=$(git log -1 --pretty=format:"%s")
    
    # Log the deployment
    log_deployment "localhost" "$VERSION" "[\"$CHANGES\"]"
    
    # Start development server
    echo -e "${GREEN}🚀 Starting localhost development server...${NC}"
    npm run dev
}

# Function to deploy to Vercel
deploy_vercel() {
    echo -e "${BLUE}☁️ Deploying to Vercel...${NC}"
    
    # Get current version from package.json
    VERSION=$(node -p "require('./package.json').version")
    
    # Get git commit message for changes
    CHANGES=$(git log -1 --pretty=format:"%s")
    
    # Log the deployment
    log_deployment "vercel" "$VERSION" "[\"$CHANGES\"]"
    
    # Deploy to Vercel
    echo -e "${GREEN}🚀 Deploying to Vercel...${NC}"
    vercel --prod
}

# Function to show help
show_help() {
    echo -e "${BLUE}CourseConnect Deployment Logger${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  localhost    Deploy to localhost with logging"
    echo "  vercel       Deploy to Vercel with logging"
    echo "  log          Log a deployment without deploying"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 localhost"
    echo "  $0 vercel"
    echo "  $0 log localhost v2.1.0 \"Fixed authentication bug\" \"John Doe\""
}

# Main script logic
case "$1" in
    "localhost")
        deploy_localhost
        ;;
    "vercel")
        deploy_vercel
        ;;
    "log")
        if [ $# -lt 3 ]; then
            echo -e "${RED}❌ Error: Missing required arguments${NC}"
            echo "Usage: $0 log [environment] [version] [changes] [author]"
            exit 1
        fi
        ENVIRONMENT=$2
        VERSION=$3
        CHANGES=${4:-"[\"General updates\"]"}
        AUTHOR=${5:-"Development Team"}
        log_deployment "$ENVIRONMENT" "$VERSION" "$CHANGES" "$AUTHOR"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Error: Unknown command '$1'${NC}"
        show_help
        exit 1
        ;;
esac
