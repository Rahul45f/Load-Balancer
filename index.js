const express = require('express');
const crypto = require('crypto');
const app = express();

const nodes = {
    "Node-A": { weight: 1, healthy: true, requests: 0 },
    "Node-B": { weight: 2, healthy: true, requests: 0 },
    "Node-C": { weight: 1, healthy: true, requests: 0 }
};

let ring = [];
const BASE_VIRTUAL_NODES = 50;

function hash(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

function buildRing() {
    ring = [];
    for (const [nodeName, nodeInfo] of Object.entries(nodes)) {
        if (nodeInfo.healthy) {
            const vNodes = BASE_VIRTUAL_NODES * nodeInfo.weight;
            for (let i = 0; i < vNodes; i++) {
                ring.push({ hash: hash(`${nodeName}#${i}`), node: nodeName });
            }
        }
    }
    ring.sort((a, b) => a.hash.localeCompare(b.hash));
}

buildRing();

const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; 
const MAX_REQUESTS = 10;

function checkRateLimit(ip) {
    const now = Date.now();
    if (!rateLimits.has(ip)) {
        rateLimits.set(ip, []);
    }
    const timestamps = rateLimits.get(ip).filter(t => now - t < RATE_LIMIT_WINDOW);
    if (timestamps.length >= MAX_REQUESTS) {
        rateLimits.set(ip, timestamps);
        return false;
    }
    timestamps.push(now);
    rateLimits.set(ip, timestamps);
    return true;
}

function getTargetNode(ip) {
    if (ring.length === 0) return null;
    const ipHash = hash(ip);
    for (let i = 0; i < ring.length; i++) {
        if (ring[i].hash >= ipHash) {
            return ring[i].node;
        }
    }
    return ring[0].node;
}

app.get('/route', (req, res) => {
    const ip = req.query.ip || req.ip;

    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
    }

    const targetNode = getTargetNode(ip);

    if (!targetNode) {
        return res.status(503).json({ error: "No healthy nodes available to handle the request." });
    }

    nodes[targetNode].requests++;

    res.json({
        message: "Request routed successfully",
        clientIP: ip,
        routedToNode: targetNode
    });
});

app.get('/metrics', (req, res) => {
    res.json({
        systemStatus: "Active",
        totalNodes: Object.keys(nodes).length,
        nodeDetails: nodes
    });
});

app.post('/health/:nodeName', (req, res) => {
    const nodeName = req.params.nodeName;
    if (nodes[nodeName]) {
        nodes[nodeName].healthy = !nodes[nodeName].healthy;
        buildRing();
        res.json({ 
            message: `Node ${nodeName} health toggled.`,
            isHealthy: nodes[nodeName].healthy 
        });
    } else {
        res.status(404).json({ error: "Node not found." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Load Balancer API running on port ${PORT}`);
});