#!/bin/bash

# Docker management scripts for Chemo Cursor project

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to build and start production services
start_production() {
    print_status "Starting production services..."
    check_docker
    
    # Create necessary directories
    mkdir -p backend/logs backend/uploads mysql/init
    
    # Build and start services
    docker-compose up -d mysql
    print_status "Waiting for MySQL to be ready..."
    sleep 30
    
    docker-compose up -d backend
    print_status "Waiting for backend to be ready..."
    sleep 20
    
    docker-compose up -d frontend
    
    print_success "Production services started successfully!"
    print_status "Frontend: http://localhost"
    print_status "Backend API: http://localhost:5000"
    print_status "MySQL: localhost:3306"
}

# Function to start development services
start_development() {
    print_status "Starting development services..."
    check_docker
    
    # Create necessary directories
    mkdir -p backend/logs backend/uploads mysql/init
    
    # Start MySQL
    docker-compose up -d mysql
    print_status "Waiting for MySQL to be ready..."
    sleep 30
    
    # Start development services
    docker-compose --profile dev up -d backend-dev frontend-dev
    
    print_success "Development services started successfully!"
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
    print_status "Rebuilding services..."
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
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  prod          Start production services"
    echo "  dev           Start development services"
    echo "  stop          Stop all services"
    echo "  restart       Restart all services"
    echo "  rebuild       Rebuild all services"
    echo "  logs [SERVICE] View logs (default: all services)"
    echo "  migrate       Run database migrations"
    echo "  reset-db      Reset database (WARNING: deletes all data)"
    echo "  status        Show service status"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 prod              # Start production"
    echo "  $0 dev               # Start development"
    echo "  $0 logs backend      # View backend logs"
    echo "  $0 logs frontend     # View frontend logs"
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
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 