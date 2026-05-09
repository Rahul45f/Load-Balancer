# Intelligent Load Balancer API

A Node.js/Express implementation of a load balancer utilizing Consistent Hashing to ensure sticky routing. This project completes all core requirements and all four bonus challenges.

## Features
- **Consistent Hashing:** Guarantees an IP always routes to the same node.
- **Weighted Routing:** Nodes can be assigned weights (e.g., Node-B has weight 2, handling twice the traffic).
- **Health Checks:** Dynamic endpoint to simulate node failure and recovery. The hash ring instantly recalculates to bypass dead nodes.
- **Rate Limiting:** Restricts individual IPs to 10 requests per minute to prevent abuse.
- **Metrics Dashboard:** Real-time visibility into traffic distribution and node health.

## Setup Instructions
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `node index.js` to start the server.
4. The API will be available at `http://localhost:3000`.

## API Endpoints
- `GET /route?ip=192.168.1.1` - Simulates a request from a specific IP.
- `GET /metrics` - View routing statistics and node health.
- `POST /health/:nodeName` - Toggle a node's health status (e.g., `POST /health/Node-A`).