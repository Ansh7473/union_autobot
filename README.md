# 🚀 UNION AUTOMATION

A unified, professional Node.js CLI tool for transfer scripts testnets. Each module runs as a separate process, preserving its own menu and logic.




![Screenshot 2025-06-11 212404](https://github.com/user-attachments/assets/c0d28bda-58e5-48ec-bce5-545c7dc79e5e)





---

## ✨ Features
-  Destinations Supported
-  BSC
-  OSMOSIS
-  HOLESKY
-  SEPOLIA
-  XION
-  BABYLON
-  CORN
-  SEI 
-  CONFIG FOR RPC CHANGE
-  SAFE Encrypted Codes No report No sybils 
## Important  
- NOTE- never use personal wallet testnet is free so use no fund wallet always
- put babylon address in babylon txt destination transfer to babylon use that address 
- put evm in private_keys.txt for evm transfer 
- put cosmos private key inside the xion.txt for cosmos chain execution
-  private_keys.txt for evm
-  xion.txt for cosmos chains xion babylon
-  BABYLON_ADDDRESS.txt for babylon address not private key 
-  CODE IS OBFUSTRICATED SO NO ONE CAN COMPLAIN AND MAKE OUR TESTENT EFFORTS WASTE
-  DONT WORRY OBFUSTRICATED? 🔒 I AM NOT A DRAINER FOR YOUR TRUST I AM MAKING PRIVATE UNOBSFUSCATED REPO BUT ONLY FOR PRIVATE PEOPLE I RECOMMEND NO FUND WALLET FOR YOUR SECURITY
-  Make sure to put your evm in private key .txt and also reciving address wallet key in xion.txt used cosmos related recving and sending address and also babylon txt used for only receive 💀 if u dont put any key inside those txt only use private key txt than all tranfer comes to my wallet that means your union task not count make sure to put your everything needed for automation in txts why it come to my wallet ? bcz the code structure used repalce method to simulate tranfer and make instructions if no new sender and reciver found it used default reciving address from instructions code structure i found some user using script but sending to my wallet thats why i am awaring 
---


## ⚡️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ansh7473/union_autobot.git
   cd union_autobot
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

---

## 🛠️ Usage

1. **Run the main CLI menu:**

   ```bash
   npm update
   ```

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

---

**Happy cross-chain transferring! 🚀🌉**
