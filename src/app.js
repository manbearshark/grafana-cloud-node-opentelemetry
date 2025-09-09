const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { register, collectDefaultMetrics, Counter, Histogram, Gauge } = require('prom-client');
const { trace, context } = require('@opentelemetry/api');
const { faker } = require('@faker-js/faker');
const pino = require('pino');


// Initialize OpenTelemetry
require('./instrumentation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
//app.use(morgan('combined'));
app.use(express.json());

// Set up Pino
logger = pino();

// TODO
// - Set up pino-HTTP logging instead of Morgan:
// - Make sure that works
// - Send logs to file and to OTEL:
// - Add in Pino OTEL with trace context:  https://github.com/pinojs/pino-opentelemetry-transport/tree/main/examples/trace-context

// Prometheus metrics
collectDefaultMetrics({ register });

// Custom metrics
const pageLoadCounter = new Counter({
  name: 'ecommerce_page_loads_total',
  help: 'Total number of page loads',
  labelNames: ['page_type', 'status']
});

const pageLoadDuration = new Histogram({
  name: 'ecommerce_page_load_duration_seconds',
  help: 'Duration of page loads in seconds',
  labelNames: ['page_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const orderCounter = new Counter({
  name: 'ecommerce_orders_total',
  help: 'Total number of orders placed',
  labelNames: ['status', 'payment_method']
});

const orderValue = new Histogram({
  name: 'ecommerce_order_value_dollars',
  help: 'Value of orders in dollars',
  labelNames: ['category'],
  buckets: [10, 25, 50, 100, 250, 500, 1000]
});

const activeUsers = new Gauge({
  name: 'ecommerce_active_users',
  help: 'Number of active users'
});

const inventoryLevel = new Gauge({
  name: 'ecommerce_inventory_level',
  help: 'Current inventory level',
  labelNames: ['product_category']
});

// Simulate inventory levels
const inventoryCategories = ['electronics', 'clothing', 'books', 'home', 'sports'];
inventoryCategories.forEach(category => {
  inventoryLevel.set({ product_category: category }, Math.floor(Math.random() * 1000) + 100);
});

// Simulate active users
setInterval(() => {
  activeUsers.set(Math.floor(Math.random() * 500) + 50);
}, 5000);

// Helper function to simulate page load time
const simulatePageLoad = (pageType, minTime = 100, maxTime = 2000) => {
  return new Promise((resolve) => {
    const loadTime = Math.random() * (maxTime - minTime) + minTime;
    const timer = pageLoadDuration.startTimer({ page_type: pageType });
    
    setTimeout(() => {
      timer();
      pageLoadCounter.inc({ page_type: pageType, status: 'success' });
      resolve(loadTime);
    }, loadTime);
  });
};

// Helper function to create a span for tracing
const createSpan = (name, operation) => {
  const tracer = trace.getTracer('ecommerce-app');
  return tracer.startActiveSpan(name, operation);
};

// Routes
app.get('/', async (req, res) => {
  const span = createSpan('homepage-load', (span) => {
    span.setAttributes({
      'page.type': 'homepage',
      'user.agent': req.get('User-Agent'),
      'request.method': req.method
    });
    
    return span;
  });

  try {
    const loadTime = await simulatePageLoad('homepage', 200, 1500);
    
    span.setAttributes({
      'page.load_time_ms': loadTime,
      'page.status': 'success'
    });

    res.json({
      message: 'Welcome to Grafana Demo Ecommerce',
      loadTime: `${loadTime.toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(error);
    span.setAttributes({
      'page.status': 'error',
      'error.message': error.message
    });
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    span.end();
  }
});

app.get('/products', async (req, res) => {
  const span = createSpan('products-page-load', (span) => {
    span.setAttributes({
      'page.type': 'products',
      'user.agent': req.get('User-Agent')
    });
    return span;
  });

  try {
    const loadTime = await simulatePageLoad('products', 300, 2000);
    
    // Generate fake products
    const products = Array.from({ length: 20 }, () => ({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      description: faker.commerce.productDescription(),
      inStock: faker.datatype.boolean()
    }));

    span.setAttributes({
      'page.load_time_ms': loadTime,
      'products.count': products.length
    });

    res.json({
      products,
      loadTime: `${loadTime.toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(error);
    span.setAttributes({
      'page.status': 'error',
      'error.message': error.message
    });
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    span.end();
  }
});

app.post('/orders', async (req, res) => {
  const span = createSpan('create-order', (span) => {
    span.setAttributes({
      'order.operation': 'create',
      'user.agent': req.get('User-Agent')
    });
    return span;
  });

  try {
    const { items, paymentMethod = 'credit_card' } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      span.setAttributes({
        'order.status': 'error',
        'error.type': 'validation'
      });
      return res.status(400).json({ error: 'Items are required' });
    }

    // Simulate order processing time
    const processingTime = Math.random() * 1000 + 200;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Calculate order total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Simulate payment success/failure
    const paymentSuccess = Math.random() > 0.1; // 90% success rate
    
    const order = {
      id: faker.string.uuid(),
      items,
      total: parseFloat(total.toFixed(2)),
      paymentMethod,
      status: paymentSuccess ? 'completed' : 'failed',
      customer: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        address: faker.location.streetAddress()
      },
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime.toFixed(2)}ms`
    };

    // Record metrics
    orderCounter.inc({ 
      status: order.status, 
      payment_method: paymentMethod 
    });
    
    orderValue.observe(
      { category: items[0]?.category || 'unknown' }, 
      total
    );

    span.setAttributes({
      'order.id': order.id,
      'order.total': total,
      'order.status': order.status,
      'order.processing_time_ms': processingTime,
      'order.items_count': items.length
    });

    res.status(paymentSuccess ? 201 : 400).json(order);
  } catch (error) {
    logger.error(error);
    span.setAttributes({
      'order.status': 'error',
      'error.message': error.message
    });
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    span.end();
  }
});

app.get('/metrics', async (req, res) => {
    try {
        const metrics = await register.metrics();
        res.set('Content-Type', register.contentType);
        res.send(metrics);      
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

app.get('/errors', async (req,res) => {
  try {
    throw("There was an error processing the queue request.");
  } catch (error) {
    logger.error(error);
    res.status(500).json({error: 'There was an error processing your request.'});
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Ecommerce app running on port ${PORT}`);
  logger.info(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  logger.info(`🏥 Health check at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
