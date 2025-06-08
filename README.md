# 🚀 UNION AUTOMATION

A unified, professional Node.js CLI tool for launching independent cross-chain transfer scripts (ETH, LINK, EURC) between Sepolia and Holesky testnets. Each module runs as a separate process, preserving its own menu and logic.

---

## ✨ Features

- **Sepolia to Holesky ETH USDC, LINK, EURC** transfers
- **ADDING MORE CHAIN SOON 
---

## ⚡️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ansh7473/UNION-AUTO_BOT.git
   cd UNION-AUTO_BOT
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

---

## 🛠️ Usage

1. **Run the main CLI menu:**
   ```bash
   node index.js
   ```
2. **Select a transfer module:**
   - Choose ETH, LINK, or EURC transfer from the menu.
   - The selected script will launch in its own process and present its own menu.

---

## 📁 Project Structure

```
index.js                         # Main CLI menu/launcher
SepoliaToHoleskyEth.js           # ETH transfer script (independent)
SepoliaToHoleskyLinkTransfer.js  # LINK transfer script (independent)
SepoliaToHoleskyEurcTransfer.js  # EURC transfer script (independent)
private_keys.txt                 # (Sensitive) Private keys for transfers
package.json                     # Project dependencies
```

---

## 🧩 Adding More Modules

To add a new transfer module:

1. **Create a new script** (e.g., `SepoliaToHoleskyNewTokenTransfer.js`) following the pattern of the existing modules.
2. **Update `index.js`:**
   - Add a new menu option for your module.
   - Use `child_process.spawn` to launch your new script, just like the existing ones.
3. **No need to modify internal logic** of other modules.

> ⚡️ **Tip:** The modular design makes it easy to add more transfer scripts in the future. Just drop in your new script and update the menu!

---

## 🔒 Security Warning

- **Never commit real private keys** or sensitive information to version control.
- Always use testnet keys for development and testing.
- Review all scripts for security best practices before using with real funds.

---

## 📜 License

MIT (or specify your preferred license)

---

**Happy cross-chain transferring! 🚀🌉**
