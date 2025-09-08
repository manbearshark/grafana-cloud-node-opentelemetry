# Grafana Cloud Ecommerce Demo

A comprehensive demonstration of Grafana Cloud monitoring capabilities using a Node.js ecommerce application that generates realistic metrics and traces.

## 🏗️ Architecture

This demo includes:

- **Node.js Ecommerce Application**: Simulates page loads, product browsing, and order processing
- **Grafana Alloy Agent**: Collects metrics and traces from the application and infrastructure
- **Docker Compose**: Orchestrates the complete stack
- **Load Generator**: Simulates realistic traffic patterns

## 📊 Metrics Collected

### Application Metrics
- `ecommerce_page_loads_total` - Total page loads by page type and status
- `ecommerce_page_load_duration_seconds` - Page load duration histogram
- `ecommerce_orders_total` - Order count by status and payment method
- `ecommerce_order_value_dollars` - Order value distribution
- `ecommerce_active_users` - Current active users
- `ecommerce_inventory_level` - Inventory levels by category

### Infrastructure Metrics
- Node.js runtime metrics (memory, CPU, event loop)
- Docker container metrics
- System metrics (CPU, memory, disk, network)
- Process metrics

## 🔍 Traces Collected

- HTTP request traces with custom spans
- Database operation traces (simulated)
- Order processing traces
- Page load performance traces

## 🚀 Quick Start

### Prerequisites

1. **Docker and Docker Compose** installed
2. **Grafana Cloud account** with:
   - Prometheus data source configured
   - Mimir (for traces) configured
   - API tokens for both services

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd grafana-demo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Grafana Cloud credentials:**
   ```bash
   cp env.example .env
   # Edit .env with your actual Grafana Cloud credentials
   ```

4. **Start the complete stack:**
   ```bash
   npm run docker:compose
   ```

5. **Verify the application is running:**
   ```bash
   curl http://localhost:3000/health
   ```

## 🔧 Configuration

### Grafana Cloud Setup

1. **Get your Prometheus credentials:**
   - Go to Grafana Cloud → Prometheus → Details
   - Copy the Remote Write endpoint and credentials

2. **Get your OTLP credentials:**
   - Go to Grafana Cloud → Mimir → Details
   - Copy the OTLP endpoint and credentials

3. **Update `.env` file:**
   ```bash
   GRAFANA_CLOUD_PROMETHEUS_ENDPOINT=https://prometheus-us-central1.grafana.net/api/prom/push
   GRAFANA_CLOUD_PROMETHEUS_USER=your_prometheus_user_id
   GRAFANA_CLOUD_PROMETHEUS_TOKEN=your_prometheus_token
   
   GRAFANA_CLOUD_OTLP_ENDPOINT=https://otlp-gateway-prod-us-central1.grafana.net/otlp
   GRAFANA_CLOUD_OTLP_USER=your_otlp_user_id
   GRAFANA_CLOUD_OTLP_TOKEN=your_otlp_token
   ```

## 📱 API Endpoints

### Application Endpoints
- `GET /` - Homepage with simulated load time
- `GET /products` - Product catalog with 20 fake products
- `POST /orders` - Create new orders
- `GET /health` - Health check endpoint
- `GET /metrics` - Prometheus metrics endpoint

### Example API Usage

**Get products:**
```bash
curl http://localhost:3000/products
```

**Create an order:**
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "1",
        "name": "Laptop",
        "price": 999.99,
        "quantity": 1,
        "category": "electronics"
      }
    ],
    "paymentMethod": "credit_card"
  }'
```

## 🐳 Docker Commands

### Build and run individual services:
```bash
# Build the ecommerce app
npm run docker:build

# Run the ecommerce app
npm run docker:run

# Build Alloy agent
docker build -t grafana-demo-alloy ./alloy

# Run Alloy agent
docker run -p 4317:4317 -p 4318:4318 grafana-demo-alloy
```

### Docker Compose commands:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## 📈 Monitoring in Grafana Cloud

### Prometheus Metrics
1. Go to your Grafana Cloud Prometheus data source
2. Query metrics like:
   - `rate(ecommerce_page_loads_total[5m])`
   - `histogram_quantile(0.95, ecommerce_page_load_duration_seconds_bucket)`
   - `ecommerce_orders_total`

### Traces
1. Go to your Grafana Cloud Mimir data source
2. Search for traces from service `grafana-demo-ecommerce`
3. Explore trace details and spans

### Recommended Dashboards
Create dashboards for:
- Application performance metrics
- Business metrics (orders, revenue)
- Infrastructure metrics
- Error rates and response times

## 🧪 Load Testing

The included load generator will automatically:
- Hit the homepage every 5 seconds
- Browse products every 5 seconds
- Create orders every 5 seconds

To increase load, modify the sleep interval in `docker-compose.yml`:
```yaml
sleep 2  # Generate more frequent requests
```

## 🔍 Troubleshooting

### Check service status:
```bash
docker-compose ps
```

### View logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs ecommerce-app
docker-compose logs alloy
```

### Test metrics endpoint:
```bash
curl http://localhost:3000/metrics
```

### Test OTLP endpoint:
```bash
curl http://localhost:4318/v1/traces
```

## 📁 Project Structure

```
grafana-demo/
├── src/
│   ├── app.js              # Main application
│   └── tracing.js          # OpenTelemetry configuration
├── alloy/
│   ├── config.alloy        # Alloy agent configuration
│   └── Dockerfile          # Alloy Docker image
├── docker-compose.yml      # Complete stack orchestration
├── Dockerfile              # Ecommerce app Docker image
├── package.json            # Node.js dependencies and scripts
├── env.example             # Environment variables template
└── README.md               # This file
```

## 🎯 Next Steps

1. **Create Grafana Dashboards** for your specific use case
2. **Set up Alerting** based on key metrics
3. **Add more realistic data** by extending the faker integration
4. **Implement more complex business logic** for richer traces
5. **Add database integration** for more realistic application behavior

## 📚 Resources

- [Grafana Cloud Documentation](https://grafana.com/docs/grafana-cloud/)
- [Grafana Alloy Documentation](https://grafana.com/docs/alloy/)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/instrumentation/js/)
- [Prometheus Client for Node.js](https://github.com/siimon/prom-client)
