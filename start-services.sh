#!/bin/bash

# Auto-start script for Chemo Cursor services
# This script will start services automatically when WSL starts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Function to check if services are running
check_services() {
    if docker-compose ps | grep -q "Up"; then
        return 0
    else
        return 1
    fi
}

# Function to start services
start_services() {
    print_status "Starting Chemo Cursor services..."
    
    # Change to project directory
    cd /mnt/c/Users/urare/OneDrive/Desktop/CHEMO_CURSOR
    
    # Start services
    docker-compose up -d
    
    print_success "Services started successfully!"
    print_status "Frontend: http://localhost"
    print_status "Backend API: http://localhost:5000"
    print_status "MySQL: localhost:3306"
}

# Function to stop services
stop_services() {
    print_status "Stopping Chemo Cursor services..."
    
    # Change to project directory
    cd /mnt/c/Users/urare/OneDrive/Desktop/CHEMO_CURSOR
    
    # Stop services
    docker-compose down
    
    print_success "Services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_status "Restarting Chemo Cursor services..."
    stop_services
    sleep 5
    start_services
}

# Function to show status
show_status() {
    print_status "Service status:"
    cd /mnt/c/Users/urare/OneDrive/Desktop/CHEMO_CURSOR
    docker-compose ps
}

# Function to setup auto-start
setup_auto_start() {
    print_status "Setting up auto-start for WSL..."
    
    # Create startup script
    cat > ~/start-chemo-services.sh << 'EOF'
#!/bin/bash
cd /mnt/c/Users/urare/OneDrive/Desktop/CHEMO_CURSOR
docker-compose up -d
EOF
    
    chmod +x ~/start-chemo-services.sh
    
    # Add to .bashrc
    if ! grep -q "start-chemo-services" ~/.bashrc; then
        echo "" >> ~/.bashrc
        echo "# Auto-start Chemo Cursor services" >> ~/.bashrc
        echo "if [ -f ~/start-chemo-services.sh ]; then" >> ~/.bashrc
        echo "    ~/start-chemo-services.sh" >> ~/.bashrc
        echo "fi" >> ~/.bashrc
    fi
    
    print_success "Auto-start setup completed!"
    print_status "Services will start automatically when you open WSL"
}

# Function to remove auto-start
remove_auto_start() {
    print_status "Removing auto-start setup..."
    
    # Remove startup script
    rm -f ~/start-chemo-services.sh
    
    # Remove from .bashrc
    sed -i '/# Auto-start Chemo Cursor services/,+3d' ~/.bashrc
    
    print_success "Auto-start removed!"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start         Start services"
    echo "  stop          Stop services"
    echo "  restart       Restart services"
    echo "  status        Show service status"
    echo "  setup         Setup auto-start"
    echo "  remove        Remove auto-start"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start              # Start services"
    echo "  $0 setup              # Setup auto-start"
    echo "  $0 status             # Show status"
}

# Main script logic
case "${1:-help}" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    "setup")
        setup_auto_start
        ;;
    "remove")
        remove_auto_start
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 