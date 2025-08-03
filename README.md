# 🚀 UNION AUTOMATION

<div align="center">

![Banner](https://img.shields.io/badge/🚀-UNION%20AUTOMATION-00D4FF?style=for-the-badge&logo=rocket&logoColor=white)
![Version](https://img.shields.io/badge/Version-3.0-28a745?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Professional%20CLI-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

</div>

> 🌟 **A unified, professional Node.js CLI tool for transfer scripts testnets. Each module runs as a separate process, preserving its own menu and logic.**

<br>

<div align="center">
<img width="742" height="561" alt="Screenshot 2025-08-03 230549" src="https://github.com/user-attachments/assets/72b9c071-112e-48f4-8a01-da47260ba75f" />
</div>

<br>

## 🎥 **Demo Video** 👇🏼

<div align="center">

https://github.com/user-attachments/assets/92089df5-162b-46d7-a7d2-0158a74dc629

</div>



---

<div align="center">

## ✨ **FEATURES**

![Features](https://img.shields.io/badge/🌐-8%20DESTINATIONS%20SUPPORTED-FF6B6B?style=for-the-badge)

</div>

<table align="center">
<tr>
<td align="center"><img src="https://img.shields.io/badge/BSC-F7931E?style=for-the-badge&logo=binance&logoColor=white" /></td>
<td align="center"><img src="https://img.shields.io/badge/OSMOSIS-5E72E4?style=for-the-badge&logo=cosmos&logoColor=white" /></td>
<td align="center"><img src="https://img.shields.io/badge/HOLESKY-627EEA?style=for-the-badge&logo=ethereum&logoColor=white" /></td>
<td align="center"><img src="https://img.shields.io/badge/SEPOLIA-627EEA?style=for-the-badge&logo=ethereum&logoColor=white" /></td>
</tr>
<tr>
<td align="center"><img src="https://img.shields.io/badge/XION-00D4FF?style=for-the-badge&logo=cosmos&logoColor=white" /></td>
<td align="center"><img src="https://img.shields.io/badge/BABYLON-FFB800?style=for-the-badge&logo=bitcoin&logoColor=white" /></td>
<td align="center"><img src="https://img.shields.io/badge/CORN-32CD32?style=for-the-badge&logo=leaf&logoColor=white" /></td>
<td align="center"><img src="https://img.shields.io/badge/SEI-FF4081?style=for-the-badge&logo=cosmos&logoColor=white" /></td>
</tr>
</table>

### 🔧 **Additional Features:**
- ⚙️ **CONFIG FOR RPC CHANGE**
- 🔒 **SAFE Encrypted Codes** - No report, No sybils
- 🛠️ **Custom Route Requests** - Create [issues](https://github.com/Ansh7473/union_autobot/issues) for specific routes 
---

<div align="center">

## 🚨 **IMPORTANT SETUP GUIDE**

![Critical](https://img.shields.io/badge/⚠️-CRITICAL%20INFORMATION-FF4444?style=for-the-badge)

</div>

> ⚠️ **NOTE:** Never use personal wallet - testnet is free, so use no fund wallet always

### 📁 **File Configuration:**

<table>
<tr>
<th>📄 File</th>
<th>🔧 Purpose</th>
<th>📝 Content</th>
</tr>
<tr>
<td><code>private_keys.txt</code></td>
<td>EVM transfers</td>
<td>EVM private keys</td>
</tr>
<tr>
<td><code>xion.txt</code></td>
<td>Cosmos chains</td>
<td>Cosmos private keys (Xion, Babylon)</td>
</tr>
<tr>
<td><code>BABYLON_ADDRESS.txt</code></td>
<td>Babylon destination</td>
<td>Babylon address (NOT private key)</td>
</tr>
</table>

### 🔒 **Security Information:**
- 🛡️ **CODE IS OBFUSCATED** - No complaints, protects testnet efforts
- � **NOT A DRAINER** - Private unobfuscated repo available for trusted users
- ⚠️ **WALLET SECURITY** - Use no-fund wallets for your security

### ⚠️ **CRITICAL WARNING:**
> 💀 **If you don't put keys in the required .txt files and only use private_key.txt, all transfers will go to my wallet!** 
> 
> This means your Union tasks won't count. The code uses a replace method - if no new sender/receiver is found, it uses default addresses from the code structure.

---

<div align="center">

## ❌ **KNOWN ERRORS**

![Error](https://img.shields.io/badge/🐛-TROUBLESHOOTING-FF6B35?style=for-the-badge)

</div>

| ❌ **Error** | 💡 **Solution** |
|-------------|-----------------|
| `input data is not a valid secp256k1 private key` | Check private key in `xion.txt` - make sure to remove `0x` prefix | 
---

<div align="center">

## ⚡️ **INSTALLATION**

![Install](https://img.shields.io/badge/📦-QUICK%20SETUP-4CAF50?style=for-the-badge)

</div>

### **Step 1:** Clone the repository
```bash
git clone https://github.com/Ansh7473/union_autobot.git
cd union_autobot
```

### **Step 2:** Install dependencies
```bash
npm install
```
**Or use the batch file:**
```bash
install.bat
```

---

<div align="center">

## 🛠️ **USAGE**

![Usage](https://img.shields.io/badge/🚀-GET%20STARTED-2196F3?style=for-the-badge)

</div>

### **Method 1:** Run with npm
```bash
npm update
```

**Or use the visual method:**

<img width="123" height="17" alt="1000164879" src="https://github.com/user-attachments/assets/5e307b62-92fc-40dc-aac4-339af3508659" />

### **Method 2:** Run directly
```bash
node index.js
```

### **Method 3:** Use batch file
[📁 Start.bat](https://github.com/Ansh7473/union_autobot/blob/main/Start.bat)

### **Step 3:** Select a transfer module
- 🎯 Choose ETH, LINK, or EURC transfer from the menu
- 🚀 The selected script will launch in its own process and present its own menu

---

<div align="center">

## 📁 **PROJECT STRUCTURE**

![Structure](https://img.shields.io/badge/🏗️-FILE%20ORGANIZATION-9C27B0?style=for-the-badge)

</div>

```
📦 union_autobot/
├── 📂 chains/          # Chain-specific transfer scripts
├── 📂 utils/           # Utility functions and helpers
├── 📂 data/            # Configuration and data files
├── 📄 index.js         # Main entry point
├── 📄 menu.js          # CLI menu interface
└── 📄 other stuffs     # Additional project files
```

---

<div align="center">

## 🧩 **ADDING MORE MODULES**

![Modules](https://img.shields.io/badge/➕-EXTENSIBLE-FF9800?style=for-the-badge)

</div>

> 💡 Create [**issues**](https://github.com/Ansh7473/union_autobot/issues) for specific utils and route requests if you have something to add

---

<div align="center">

## 🔒 **SECURITY WARNING**

![Security](https://img.shields.io/badge/🛡️-SECURITY%20FIRST-E91E63?style=for-the-badge)

</div>

### ⚠️ **Critical Security Guidelines:**

| 🚫 **DON'T** | ✅ **DO** |
|-------------|----------|
| Never commit real private keys | Always use testnet keys |
| Don't use personal wallets | Use no-fund wallets only |
| Skip security reviews | Review scripts before real funds |

---

<div align="center">

![Footer](https://img.shields.io/badge/🚀🌉-Happy%20Cross--Chain%20Transferring!-00BCD4?style=for-the-badge)

**Happy cross-chain transferring! 🚀🌉**

</div>
