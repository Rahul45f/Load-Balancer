# Load Balancer API - Testing Guide 🧪

This guide provides step-by-step instructions to test all core functionalities and bonus challenges of the Intelligent Load Balancer API. 

Because the API is deployed live, you do not need to install any code locally to verify the results. You can perform these tests using your web browser, Postman, or cURL.

**Live Base URL:** `https://load-balancer-zqpa.onrender.com`

---

## Test 1: Core Constraint - Consistent Hashing (Sticky Sessions)
**Goal:** Verify that a specific IP address always routes to the exact same node, regardless of how many times it connects.

1. Open your browser and navigate to:
   `https://load-balancer-zqpa.onrender.com/route?ip=104.28.10.50`
2. Note the `routedToNode` value in the JSON response (e.g., "Node-C").
3. Refresh the page 5 times.
4. **Expected Result:** The `routedToNode` remains exactly the same for every request, proving the consistent hashing algorithm is working.

---

## Test 2: Bonus Challenge - Metrics & Weighted Routing
**Goal:** Verify the system tracks requests and assigns different weights to servers (e.g., giving a stronger server more traffic).

1. Navigate to:
   `https://load-balancer-zqpa.onrender.com/metrics`
2. **Expected Result:** You will see a `nodeDetails` object. 
   - Notice that `Node-B` has a `weight: 2`, meaning it is configured to handle twice as many virtual nodes on the hash ring as Node-A or Node-C. 
   - You can also view the `requests` counter, which tracks how many times each node has been hit during your session.

---

## Test 3: Bonus Challenge - Dynamic Node Health Checks
**Goal:** Verify that if a node crashes (becomes unhealthy), the load balancer instantly recalculates the ring and routes traffic to the remaining healthy nodes without dropping the request.

*Note: This requires a `POST` request. You can use the provided Postman collection or cURL.*

1. First, find an IP that routes to **Node-A**. Keep testing IPs until you get one (e.g., `ip=192.168.1.100`).
2. Simulate a crash on Node-A by sending a POST request:
   - **cURL:** `curl -X POST https://load-balancer-zqpa.onrender.com/health/Node-A`
   - **Expected Result:** `{"message": "Node Node-A health toggled.", "isHealthy": false}`
3. Send the route request from Step 1 again:
   `https://load-balancer-zqpa.onrender.com/route?ip=192.168.1.100`
4. **Expected Result:** The request is no longer routed to Node-A. It has safely fallen back to another available node (Node-B or Node-C).
5. Send the POST request to `/health/Node-A` again to bring the server back online.

---

## Test 4: Bonus Challenge - Rate Limiting
**Goal:** Verify that the API protects itself from malicious spam or DDoS attacks by limiting a single IP to 10 requests per minute.

1. Open this URL in your browser:
   `https://load-balancer-zqpa.onrender.com/route?ip=99.99.99.99`
2. Rapidly refresh the page 11 times.
3. **Expected Result:** On the 11th attempt, the system will block the request and return a `429 Too Many Requests` status with the message: 
   `"error": "Rate limit exceeded. Try again later."`

---
*Thank you for taking the time to review this implementation!*