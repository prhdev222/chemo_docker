#!/bin/bash

# Docker management scripts for Chemo Cursor project on Raspberry Pi

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

# Function to check if running on Raspberry Pi
check_raspberry_pi() {
    if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
        print_warning "This script is optimized for Raspberry Pi"
    fi
}

# Function to check system resources
check_resources() {
    print_status "Checking system resources..."
    
    # Check available memory
    total_mem=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    available_mem=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    
    print_status "Total memory: ${total_mem}MB"
    print_status "Available memory: ${available_mem}MB"
    
    if [ "$total_mem" -lt 2048 ]; then
        print_warning "Raspberry Pi should have at least 2GB RAM for optimal performance"
    fi
    
    # Check available disk space
    disk_space=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    print_status "Available disk space: ${disk_space}GB"
    
    if [ "$disk_space" -lt 5 ]; then
        print_warning "Low disk space. Consider freeing up space before proceeding."
    fi
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        print_status "On Raspberry Pi, you can start Docker with: sudo systemctl start docker"
        exit 1
    fi
}

# Function to optimize Docker for Raspberry Pi
optimize_docker() {
    print_status "Optimizing Docker for Raspberry Pi..."
    
    # Create or update daemon.json
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Hard": 64000,
      "Name": "nofile",
      "Soft": 64000
    }
  }
}
EOF
    
    # Restart Docker
    sudo systemctl restart docker
    print_success "Docker optimized for Raspberry Pi"
}

# Function to build and start production services
start_production() {
    print_status "Starting production services on Raspberry Pi..."
    check_docker
    check_raspberry_pi
    check_resources
    
    # Create necessary directories
    mkdir -p backend/logs backend/uploads mysql/init
    
    # Build and start services
    print_status "Building and starting MySQL..."
    docker-compose up -d mysql
    print_status "Waiting for MySQL to be ready..."
    sleep 45  # Longer wait for Raspberry Pi
    
    print_status "Building and starting backend..."
    docker-compose up -d backend
    print_status "Waiting for backend to be ready..."
    sleep 30  # Longer wait for Raspberry Pi
    
    print_status "Building and starting frontend..."
    docker-compose up -d frontend
    
    print_success "Production services started successfully on Raspberry Pi!"
    print_status "Frontend: http://localhost"
    print_status "Backend API: http://localhost:5000"
    print_status "MySQL: localhost:3306"
    print_status "System resources:"
    docker stats --no-stream
}

# Function to start development services
start_development() {
    print_status "Starting development services on Raspberry Pi..."
    check_docker
    check_raspberry_pi
    check_resources
    
    # Create necessary directories
    mkdir -p backend/logs backend/uploads mysql/init
    
    # Start MySQL
    docker-compose up -d mysql
    print_status "Waiting for MySQL to be ready..."
    sleep 45  # Longer wait for Raspberry Pi
    
    # Start development services
    docker-compose --profile dev up -d backend-dev frontend-dev
    
    print_success "Development services started successfully on Raspberry Pi!"
    print_status "Frontend: http://localhost:5173"
    print_status "Backend API: http://localhost:5001"
    print_status "MySQL: localhost:3306"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped!"
}

# Function to rebuild services
rebuild() {
    print_status "Rebuilding services for Raspberry Pi..."
    docker-compose down
    docker-compose build --no-cache
    print_success "Services rebuilt successfully!"
}

# Function to view logs
view_logs() {
    local service=${1:-"all"}
    if [ "$service" = "all" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose exec backend npx prisma migrate deploy
    print_success "Migrations completed!"
}

# Function to reset database
reset_database() {
    print_warning "This will delete all data in the database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting database..."
        docker-compose down
        docker volume rm chemo_cursor_mysql_data
        print_success "Database reset completed!"
    else
        print_status "Database reset cancelled."
    fi
}

# Function to show service status
show_status() {
    print_status "Service status:"
    docker-compose ps
    echo ""
    print_status "System resources:"
    docker stats --no-stream
}

# Function to monitor system resources
monitor_resources() {
    print_status "Monitoring system resources (Press Ctrl+C to stop)..."
    watch -n 5 'echo "=== Docker Stats ==="; docker stats --no-stream; echo ""; echo "=== System Resources ==="; free -h; echo ""; df -h /'
}

# Function to cleanup Docker
cleanup_docker() {
    print_status "Cleaning up Docker resources..."
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    print_success "Docker cleanup completed!"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Raspberry Pi Optimized Commands:"
    echo "  prod          Start production services"
    echo "  dev           Start development services"
    echo "  stop          Stop all services"
    echo "  restart       Restart all services"
    echo "  rebuild       Rebuild all services"
    echo "  logs [SERVICE] View logs (default: all services)"
    echo "  migrate       Run database migrations"
    echo "  reset-db      Reset database (WARNING: deletes all data)"
    echo "  status        Show service status"
    echo "  monitor       Monitor system resources"
    echo "  cleanup       Cleanup Docker resources"
    echo "  optimize      Optimize Docker for Raspberry Pi"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 prod              # Start production"
    echo "  $0 dev               # Start development"
    echo "  $0 monitor           # Monitor resources"
    echo "  $0 cleanup           # Cleanup Docker"
}

# Main script logic
case "${1:-help}" in
    "prod"|"production")
        start_production
        ;;
    "dev"|"development")
        start_development
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        start_production
        ;;
    "rebuild")
        rebuild
        ;;
    "logs")
        view_logs "$2"
        ;;
    "migrate")
        run_migrations
        ;;
    "reset-db")
        reset_database
        ;;
    "status")
        show_status
        ;;
    "monitor")
        monitor_resources
        ;;
    "cleanup")
        cleanup_docker
        ;;
    "optimize")
        optimize_docker
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