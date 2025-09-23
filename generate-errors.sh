while true; do
    echo 'Generating load + errors...'
    curl -s http://localhost:3000/ > /dev/null
    curl -s http://localhost:3000/products > /dev/null
    curl -s -X POST http://localhost:3000/orders -H 'Content-Type: application/json' -d '{\"items\":[{\"id\":\"1\",\"name\":\"Test Product\",\"price\":29.99,\"quantity\":1,\"category\":\"electronics\"}],\"paymentMethod\":\"credit_card\"}' > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    curl -s http://localhost:3000/errors > /dev/null
    sleep 2
done
