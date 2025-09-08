#!/usr/bin/env node

/**
 * Simple test script to generate load and test the ecommerce application
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Grafana-Demo-Test/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testHealth() {
  console.log('🏥 Testing health endpoint...');
  try {
    const result = await makeRequest('/health');
    console.log(`   Status: ${result.status}`);
    console.log(`   Uptime: ${result.data.uptime}s`);
    console.log(`   Memory: ${Math.round(result.data.memory.heapUsed / 1024 / 1024)}MB`);
  } catch (error) {
    console.error('   ❌ Health check failed:', error.message);
  }
}

async function testHomepage() {
  console.log('🏠 Testing homepage...');
  try {
    const result = await makeRequest('/');
    console.log(`   Status: ${result.status}`);
    console.log(`   Load time: ${result.data.loadTime}`);
    console.log(`   Active users: ${result.data.metrics.activeUsers}`);
  } catch (error) {
    console.error('   ❌ Homepage test failed:', error.message);
  }
}

async function testProducts() {
  console.log('🛍️  Testing products endpoint...');
  try {
    const result = await makeRequest('/products');
    console.log(`   Status: ${result.status}`);
    console.log(`   Products count: ${result.data.products.length}`);
    console.log(`   Load time: ${result.data.loadTime}`);
  } catch (error) {
    console.error('   ❌ Products test failed:', error.message);
  }
}

async function testOrder() {
  console.log('🛒 Testing order creation...');
  try {
    const orderData = {
      items: [
        {
          id: 'test-1',
          name: 'Test Product',
          price: 29.99,
          quantity: 2,
          category: 'electronics'
        }
      ],
      paymentMethod: 'credit_card'
    };
    
    const result = await makeRequest('/orders', 'POST', orderData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Order ID: ${result.data.id}`);
    console.log(`   Total: $${result.data.total}`);
    console.log(`   Status: ${result.data.status}`);
  } catch (error) {
    console.error('   ❌ Order test failed:', error.message);
  }
}

async function testMetrics() {
  console.log('📊 Testing metrics endpoint...');
  try {
    const result = await makeRequest('/metrics');
    console.log(`   Status: ${result.status}`);
    console.log(`   Metrics length: ${result.data.length} characters`);
    
    // Count some key metrics
    const metrics = result.data;
    const pageLoads = (metrics.match(/ecommerce_page_loads_total/g) || []).length;
    const orders = (metrics.match(/ecommerce_orders_total/g) || []).length;
    console.log(`   Page load metrics: ${pageLoads}`);
    console.log(`   Order metrics: ${orders}`);
  } catch (error) {
    console.error('   ❌ Metrics test failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Grafana Demo Ecommerce Tests\n');
  
  await testHealth();
  console.log('');
  
  await testHomepage();
  console.log('');
  
  await testProducts();
  console.log('');
  
  await testOrder();
  console.log('');
  
  await testMetrics();
  console.log('');
  
  console.log('✅ All tests completed!');
  console.log('\n📈 Check your Grafana Cloud dashboards to see the metrics and traces!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  makeRequest,
  testHealth,
  testHomepage,
  testProducts,
  testOrder,
  testMetrics,
  runTests
};
