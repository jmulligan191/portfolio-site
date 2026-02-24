#!/bin/bash

# PM2 Management Script for Portfolio Website
# Usage: bash scripts/pm2.sh [start|stop|restart|status|logs|delete]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="portfolio-website"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PM2 is installed
check_pm2() {
  if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing globally..."
    npm install -g pm2
    print_success "PM2 installed successfully"
  else
    print_info "PM2 found: $(pm2 --version)"
  fi
}

# Create PM2 ecosystem config
create_ecosystem_config() {
  print_info "Creating PM2 ecosystem configuration..."
  
  cat > "$PROJECT_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'portfolio-website',
      script: 'pnpm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: process.env.PORT || 1910,
        NODE_ENV: 'production',
      },
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Logging
      out_file: 'logs/out.log',
      err_file: 'logs/err.log',
      merge_logs: true,
      // Auto-restart
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'public/resumes', 'logs'],
      // Error handling
      max_restarts: 10,
      min_uptime: '10s',
    }
  ]
};
EOF
  
  print_success "Ecosystem config created at ecosystem.config.js"
}

# Start the app with PM2
start_app() {
  print_info "Starting application with PM2..."
  
  check_pm2
  create_ecosystem_config
  
  cd "$PROJECT_DIR"
  
  # Check if built
  if [ ! -d ".next" ]; then
    print_warning ".next directory not found. Building now..."
    print_info "Running: pnpm build"
    pnpm build
  fi
  
  # Create logs directory
  mkdir -p logs
  
  # Start with PM2
  pm2 start ecosystem.config.js --update-env
  pm2 save
  
  print_success "Application started with PM2"
  print_info "App name: $APP_NAME"
  print_info "Port: $(grep PORT "$PROJECT_DIR/.env" | cut -d= -f2 | tr -d '"' || echo '1910')"
  print_info "Check status: pm2 status"
  print_info "View logs: pm2 logs portfolio-website"
}

# Stop the app
stop_app() {
  print_info "Stopping application..."
  pm2 stop "$APP_NAME" 2>/dev/null || print_warning "App not running"
  print_success "Application stopped"
}

# Restart the app
restart_app() {
  print_info "Restarting application..."
  cd "$PROJECT_DIR"
  
  # Rebuild
  print_info "Building application..."
  pnpm build
  
  if pm2 list | grep -q "portfolio-website"; then
    pm2 restart "$APP_NAME" --update-env
    print_success "Application restarted"
  else
    print_warning "App not found in PM2. Starting fresh..."
    start_app
  fi
}

# Delete/remove the app from PM2
delete_app() {
  print_warning "Deleting application from PM2..."
  pm2 delete "$APP_NAME" 2>/dev/null || print_warning "App not found"
  print_success "Application removed from PM2"
}

# Show status
show_status() {
  print_info "Application status:"
  pm2 status "$APP_NAME" 2>/dev/null || print_warning "App not running"
}

# Show logs
show_logs() {
  print_info "Showing last 50 lines of logs (press Ctrl+C to exit)..."
  pm2 logs "$APP_NAME" --lines 50 --err --out --timestamp 2>/dev/null || print_warning "App not found"
}

# Setup startup on boot
setup_startup() {
  print_info "Setting up PM2 to start on boot..."
  
  # Get current user
  CURRENT_USER=$(whoami)
  
  # Startup script depends on init system
  if command -v systemctl &> /dev/null; then
    print_info "Using systemd..."
    pm2 startup systemd -u "$CURRENT_USER" --hp /home/"$CURRENT_USER"
    echo ""
    print_warning "Please run the command that appeared above, then run: pm2 save"
  elif command -v service &> /dev/null; then
    print_info "Using init.d..."
    pm2 startup -u "$CURRENT_USER" --hp /home/"$CURRENT_USER"
    echo ""
    print_warning "Please run the command that appeared above, then run: pm2 save"
  else
    print_error "Unsupported init system"
  fi
}

# Display help
show_help() {
  cat << EOF
Portfolio Website PM2 Manager

Usage: bash scripts/pm2.sh [command]

Commands:
  start         Build (if needed) and start the application with PM2
  stop          Stop the running application
  restart       Restart the application (rebuilds)
  delete        Remove the application from PM2
  status        Show application status
  logs          Show application logs
  startup       Setup PM2 to start on system boot
  help          Show this help message

Examples:
  bash scripts/pm2.sh start      # Start the app
  bash scripts/pm2.sh restart    # Restart and rebuild the app
  bash scripts/pm2.sh logs       # View live logs
  bash scripts/pm2.sh status     # Check current status

Environment:
  PORT          Port to run on (default: 1910 from .env)
  NODE_ENV      Set to 'production' automatically

Notes:
  - This script requires PM2 (installed automatically if missing)
  - .env file must be present in project root
  - Application will be built if .next doesn't exist
  - Logs are saved to logs/ directory
  - Uses pnpm to run 'next start' which respects .env variables
EOF
}

# Main script
case "${1:-help}" in
  start)
    start_app
    ;;
  stop)
    stop_app
    ;;
  restart)
    restart_app
    ;;
  delete)
    delete_app
    ;;
  status)
    show_status
    ;;
  logs)
    show_logs
    ;;
  startup)
    setup_startup
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    print_error "Unknown command: $1"
    echo ""
    show_help
    exit 1
    ;;
esac
