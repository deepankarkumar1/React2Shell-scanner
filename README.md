# ⚛️ React2Shell Scanner - Web Edition

![Node.js](https://img.shields.io/badge/Node.js-14.x+-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Vulnerability](https://img.shields.io/badge/CVE-2025--55182-Critical-red?style=for-the-badge)

**Complete Vulnerability Scanner and Interactive Shell for CVE-2025-55182**

A professional-grade web-based security tool for detecting and exploiting the React2Shell vulnerability in Next.js applications. Features a modern web interface with automated scanning and interactive shell capabilities.

---

## 🌟 Features

### 🔍 Automated Vulnerability Scanning
- **One-click scanning** - Simple web interface for quick vulnerability assessment
- **Automated detection** - Multi-step verification process
- **System profiling** - Automatic collection of target system information
- **Real-time updates** - Live scan progress with detailed step tracking

### 💻 Interactive Web Shell
- **Browser-based terminal** - Full command execution in your browser
- **Directory tracking** - Maintains current working directory across commands
- **Command history** - Server-side session management
- **Modern UI** - Beautiful, responsive interface
- **Cross-platform support** - Works with both Linux and Windows targets

### 🛡️ Security Features
- **No external dependencies** - Pure Node.js implementation
- **Session isolation** - Multiple concurrent scan sessions
- **Timeout protection** - Prevents hanging requests
- **Error handling** - Graceful error recovery

---

## 📸 Screenshots

### Main Interface
```
╔════════════════════════════════════════════════════════════╗
║              ⚛️ React2Shell Scanner                        ║
║              Next.js Server Actions Vulnerability          ║
║              CVE-2025-55182                                ║
╚════════════════════════════════════════════════════════════╝
```

### Vulnerability Scanner
- Real-time scan progress
- Color-coded status indicators
- Detailed system information display

### Interactive Shell
- Full terminal emulation in browser
- Root mode toggle
- Live command execution

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14.x or higher (no npm packages needed!)
- A target Next.js application to test

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/react2shell-scanner.git
cd react2shell-scanner

# Start the server (no npm install needed!)
node server.js
```

### Usage

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **Open your browser:**
   ```
   http://localhost:3000
   ```

3. **Enter target URL and scan:**
   - Enter the target Next.js application URL
   - Click "Start Scan"
   - Wait for automated vulnerability detection

4. **Use the interactive shell:**
   - If target is vulnerable, click "Start Shell Session"
   - Execute commands in the browser terminal
   - Toggle root mode as needed

---

## 📋 How It Works

### Vulnerability Detection Process

1. **Connectivity Check**
   - Sends initial probe to target
   - Verifies Next.js server actions endpoint

2. **Exploitation Test**
   - Constructs CVE-2025-55182 payload
   - Uses prototype pollution attack vector
   - Injects command execution code

3. **System Profiling** (Background)
   - Silently gathers user information (`whoami`, `id`)
   - Collects system details (`uname -a`)
   - Identifies current working directory
   - Information stored for shell session use

### Exploit Mechanism

The scanner exploits CVE-2025-55182 through:

1. **Multipart Form Data Pollution**
   ```javascript
   Content-Disposition: form-data; name="0"
   {"then":"$1:__proto__:then","status":"resolved_model",...}
   ```

2. **Prototype Chain Manipulation**
   ```javascript
   "_response":{"_prefix":"<PAYLOAD>","_formData":{"get":"$1:constructor:constructor"}}
   ```

3. **Command Injection**
   ```javascript
   var res=process.mainModule.require('child_process').execSync('...')
   ```

4. **Output Exfiltration**
   - Base64 encodes command output
   - Returns via redirect header
   - Automatically decoded in scanner

---

## 🎯 API Endpoints

### Scanner API

#### `POST /api/scan`
Start a new vulnerability scan.

**Request:**
```json
{
  "targetUrl": "https://example.com/"
}
```

**Response:**
```json
{
  "scanId": "1706543210123"
}
```

#### `GET /api/scan/{scanId}`
Get scan results.

**Response:**
```json
{
  "id": "1706543210123",
  "target": "https://example.com/",
  "status": "completed",
  "vulnerable": true,
  "systemInfo": {
    "user": "ubuntu",
    "userId": "uid=1000(ubuntu) gid=1000(ubuntu)",
    "system": "Linux webserver 5.4.0-88-generic",
    "workingDir": "/home/ubuntu"
  },
  "hasSudo": true,
  "steps": [...]
}
```

### Shell API

#### `POST /api/session/create`
Create a new shell session.

**Request:**
```json
{
  "targetUrl": "https://example.com/"
}
```

**Response:**
```json
{
  "sessionId": "1706543210456"
}
```

#### `POST /api/session/execute`
Execute a command in a session.

**Request:**
```json
{
  "sessionId": "1706543210456",
  "command": "ls -la"
}
```

**Response:**
```json
{
  "success": true,
  "output": "total 48\ndrwxr-xr-x 4 ubuntu ubuntu 4096 Jan 29 10:30 .\n...",
  "currentDir": "/home/ubuntu",
  "rootMode": false
}
```

---

## 🎮 Shell Commands

### Special Commands

| Command | Description |
|---------|-------------|
| `cd <path>` | Change directory (tracked across commands) |
| `clear` | Clear terminal screen |

### Linux Commands

All standard Linux/Unix commands are supported:
- `whoami`, `id`, `pwd` - User and directory information
- `ls`, `cat`, `grep`, `find` - File operations
- `ps`, `netstat`, `ss`, `ip` - Process and network monitoring
- `uname`, `df`, `ifconfig` - System information
- And many more...

### Windows Commands

Standard Windows commands are also supported:
- `whoami`, `dir`, `type` - Basic operations
- `tasklist`, `netstat`, `ipconfig` - System monitoring
- `systeminfo`, `set` - System information
- `wmic`, `reg query` - Advanced queries
- And many more...

### Command Examples

**Linux:**
```bash
user@target:~$ whoami
ubuntu

user@target:~$ ls -la
total 48
drwxr-xr-x 4 ubuntu ubuntu 4096 Jan 29 10:30 .

user@target:~$ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
```

**Windows:**
```cmd
C:\Users\Admin> whoami
DESKTOP-ABC123\Admin

C:\Users\Admin> dir
Directory of C:\Users\Admin

C:\Users\Admin> systeminfo
Host Name: DESKTOP-ABC123
```

---

## 🔧 Configuration

### Change Server Port

Edit `server.js` or set environment variable:
```bash
PORT=8080 node server.js
```

### Adjust Timeout

In `server.js`, modify the timeout value:
```javascript
timeout: 15000  // 15 seconds (default)
```

### Custom Domain Binding

```bash
# Bind to all interfaces
HOST=0.0.0.0 PORT=3000 node server.js
```

---

## 🛡️ Security Considerations

### For Security Researchers

✅ **DO:**
- Obtain written authorization before testing
- Use in controlled lab environments
- Document all findings professionally
- Follow responsible disclosure practices
- Respect scope and rules of engagement

❌ **DON'T:**
- Test production systems without permission
- Cause damage or disruption
- Exfiltrate unnecessary data
- Share vulnerabilities publicly before patch
- Use for malicious purposes

### For Defenders

**Detection Signatures:**
- Monitor for multipart form-data with prototype pollution patterns
- Look for base64-encoded payloads in HTTP headers
- Alert on `child_process.execSync` in server logs
- Track unusual Next-Action header combinations

**Mitigation Steps:**
1. Update Next.js to patched version
2. Implement strict input validation
3. Use Object.freeze() on critical prototypes
4. Enable CSP headers
5. Implement rate limiting
6. Monitor for suspicious server action calls

---

## 📊 Project Structure

```
react2shell-scanner/
├── server.js           # Backend API server
├── index.html          # Web interface
├── package.json        # Node.js configuration
├── README.md          # This file
└── LICENSE            # MIT License
```

---

## 🔬 Technical Details

### CVE-2025-55182 Explanation

The vulnerability exists in Next.js server actions due to improper handling of multipart form data, allowing:

1. **Prototype Pollution** - Manipulation of JavaScript object prototypes
2. **Constructor Access** - Bypassing security restrictions
3. **Code Injection** - Executing arbitrary JavaScript
4. **Command Execution** - Running system commands via child_process

### Attack Vector

```
Client → Malicious Multipart Payload → Next.js Server Action
     → Prototype Pollution → Constructor Access
     → child_process.execSync → Command Execution
     → Base64 Output → Redirect Header → Client
```

---

## 🆚 Comparison with Other Tools

| Feature | React2Shell Scanner | Python Version | Metasploit |
|---------|-------------------|----------------|------------|
| Web Interface | ✅ Yes | ❌ No | ⚠️ Limited |
| Zero Dependencies | ✅ Yes | ❌ No (requests) | ❌ No |
| Interactive Shell | ✅ Browser | ✅ CLI | ✅ CLI |
| Automated Scanning | ✅ Yes | ⚠️ Manual | ✅ Yes |
| Real-time Updates | ✅ Yes | ❌ No | ⚠️ Limited |
| Session Management | ✅ Yes | ❌ No | ✅ Yes |

---

## 🐛 Troubleshooting

### Connection Errors

**Problem:** `Request failed: ECONNREFUSED`

**Solutions:**
- Verify target URL is correct
- Check if target is accessible
- Ensure firewall isn't blocking

### No Output in Response

**Problem:** `No output in response (Status: 200)`

**Solutions:**
- Target may not be vulnerable
- Server action endpoint might be different
- WAF might be blocking the payload

### Browser Issues

**Problem:** Shell not responding

**Solutions:**
- Check browser console for errors
- Ensure JavaScript is enabled
- Try a different browser
- Clear browser cache

---

## 📈 Future Enhancements

- [ ] File download functionality in web UI
- [ ] Multiple concurrent shell sessions
- [ ] Command history persistence
- [ ] Export scan reports (PDF/JSON)
- [ ] Batch scanning multiple targets
- [ ] Custom payload editor
- [ ] Docker containerization
- [ ] WebSocket for real-time shell
- [ ] Advanced privilege escalation modules
- [ ] Automated post-exploitation

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

### Code Style
- Use ES6+ features
- Follow existing code structure
- Add comments for complex logic
- Test thoroughly before submitting

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## ⚠️ Legal Disclaimer

**FOR EDUCATIONAL AND AUTHORIZED TESTING ONLY**

This tool is intended for:
- Security research and analysis
- Authorized penetration testing
- Red team operations with explicit permission
- Educational demonstrations in controlled environments

**Unauthorized access to computer systems is illegal under:**
- Computer Fraud and Abuse Act (CFAA) - United States
- Computer Misuse Act - United Kingdom
- Similar legislation worldwide

The authors and contributors are not responsible for any misuse or damage caused by this tool. Users must obtain written authorization before testing any systems they do not own.

**By using this tool, you agree to:**
- Only test systems you own or have explicit permission to test
- Comply with all applicable laws and regulations
- Use the tool ethically and responsibly
- Accept full responsibility for your actions

---

## 🙏 Acknowledgments

- Original Python implementation authors
- Security researchers working on Next.js vulnerabilities
- Node.js core team for excellent built-in modules
- The open-source security community

---

## 📞 Contact

For security issues, please use responsible disclosure channels.

---

**Stay Legal. Stay Ethical. Stay Secure.** 🛡️

Made with ❤️ by Security Researchers