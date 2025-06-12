/**
 * Menu functions for UNION Cross-Chain Automation
 * Handles CLI menu navigation and script execution
 */

const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ============= Menu Interface =============
function displayBanner() {
    console.clear();
    console.log("\n🌉 ========================================== 🌉");
    console.log("  UNION Cross-Chain Automation");
    console.log("🌉 ========================================== 🌉\n");
}

function displayMainMenu(isUpdateAvailable, latestVersion) {
    console.log("🔹 Select an Option:");
    console.log("1️⃣  Sepolia → Holesky");
    console.log("2️⃣  Holesky → Sepolia");
    console.log("3️⃣  SEI → CORN");
    console.log("4️⃣  Xion → Babylon");
    console.log("5️⃣  Babylon Transfers");
    console.log("6️⃣  Check for Updates");
    console.log("7️⃣  Exit");
    // Display update notification
    if (isUpdateAvailable && latestVersion) {
        console.log(`\n⚠️ New Update Available: v${latestVersion.version} (Select 6 to update)`);
    }
    console.log();
}

async function getUserInput(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function runScript(scriptName) {
    const scriptPath = path.join(__dirname, scriptName);
    try {
        await fs.access(scriptPath);
        const child = spawn('node', [scriptPath], { stdio: ['inherit', 'inherit', 'inherit'] });

        return new Promise((resolve) => {
            child.on('error', (error) => {
                console.log(`❌ Error running ${scriptName}: ${error.message}`);
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });

            child.on('exit', (code) => {
                if (code !== 0) {
                    console.log(`⚠️ ${scriptName} exited with code ${code}`);
                    console.log('Press Enter to return to the menu...');
                    getUserInput('').then(() => resolve());
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        console.log(`❌ Script ${scriptName} not found or inaccessible: ${error.message}`);
        console.log('Press Enter to return to the menu...');
        await getUserInput('');
        return;
    }
}

async function runScriptWithArg(scriptName, arg) {
    const scriptPath = path.join(__dirname, scriptName);
    try {
        await fs.access(scriptPath);
        const child = spawn('node', [scriptPath, arg], { stdio: ['inherit', 'inherit', 'inherit'] });
        return new Promise((resolve) => {
            child.on('error', (error) => {
                console.log(`❌ Error running ${scriptName}: ${error.message}`);
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });
            child.on('exit', (code) => {
                if (code !== 0) {
                    console.log(`⚠️ ${scriptName} exited with code ${code}`);
                    console.log('Press Enter to return to the menu...');
                    getUserInput('').then(() => resolve());
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        console.log(`❌ Script ${scriptName} not found or inaccessible: ${error.message}`);
        console.log('Press Enter to return to the menu...');
        await getUserInput('');
        return;
    }
}

// ============= Hierarchical Menu =============
async function mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion) {
    displayBanner();
    displayMainMenu(isUpdateAvailable, latestVersion);
    const choice = await getUserInput("👉 Enter your choice (1-7): ");

    if (choice === "1") {
        await sepoliaToHoleskyMenu();
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "2") {
        await holeskyToSepoliaMenu();
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "3") {
        await seiToCornMenu();
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "4") {
        await xionToBabylonMenu();
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "5") {
        await runScript('BabylonToOthersTransfer.js');
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "6") {
        const continueRunning = await checkVersionCallback();
        if (continueRunning) {
            await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
        }
    } else if (choice === "7") {
        console.log("\n👋 Goodbye!");
        rl.close();
        process.exit(0);
    } else {
        console.log("\n❌ Invalid choice. Please try again.");
        setTimeout(() => mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion), 1500);
    }
}

async function sepoliaToHoleskyMenu() {
    console.clear();
    console.log("\n🌉 Sepolia → Holesky: Select Token");
    console.log("1️⃣  ETH");
    console.log("2️⃣  LINK");
    console.log("3️⃣  EURC");
    console.log("4️⃣  USDC");
    console.log("5️⃣  Back\n");
    const token = await getUserInput("👉 Enter your choice (1-5): ");
    switch (token) {
        case "1":
            await runScript('SepoliaToHoleskyEthTransfer.js');
            break;
        case "2":
            await runScript('SepoliaToHoleskyLinkTransfer.js');
            break;
        case "3":
            await runScript('SepoliaToHoleskyEurcTransfer.js');
            break;
        case "4":
            await runScript('SepoliaToHoleskyUsdcTransfer.js');
            break;
        case "5":
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(sepoliaToHoleskyMenu, 1500);
    }
}

async function holeskyToSepoliaMenu() {
    console.clear();
    console.log("\n🌉 Holesky → Sepolia: Select Token");
    console.log("1️⃣  ETH");
    console.log("2️⃣  LINK");
    console.log("3️⃣  EURC");
    console.log("4️⃣  USDC");
    console.log("5️⃣  Back\n");
    const token = await getUserInput("👉 Enter your choice (1-5): ");
    switch (token) {
        case "1":
            await runScript('HoleskyToSepoliaETH.js');
            break;
        case "2":
            await runScript('HoleskyToSepoliaLink.js');
            break;
        case "3":
            await runScript('HoleskyToSepoliaEurc.js');
            break;
        case "4":
            await runScript('HoleskyToSepoliaUsdc.js');
            break;
        case "5":
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(holeskyToSepoliaMenu, 1500);
    }
}

async function seiToCornMenu() {
    console.clear();
    console.log("\n🌉 SEI → CORN: Select Token");
    console.log("1️⃣  SEI");
    console.log("2️⃣  Back\n");
    const token = await getUserInput("👉 Enter your choice (1-2): ");
    switch (token) {
        case "1":
            await runScript('SeiToCornSEITransfer.js');
            break;
        case "2":
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(seiToCornMenu, 1500);
    }
}

async function xionToBabylonMenu() {
    console.clear();
    console.log("\n🌉 Xion → Babylon: Select Token");
    console.log("1️⃣  USDC");
    console.log("2️⃣  XION");
    console.log("3️⃣  Back\n");
    const token = await getUserInput("👉 Enter your choice (1-3): ");
    switch (token) {
        case "1":
            await runScriptWithArg('Xion_To_Babylon_XION_USDC.js', 'USDC');
            break;
        case "2":
            await runScriptWithArg('Xion_To_Babylon_XION_USDC.js', 'XION');
            break;
        case "3":
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(xionToBabylonMenu, 1500);
    }
}

module.exports = {
    mainMenu,
    getUserInput // Exported for use in index.js
};
