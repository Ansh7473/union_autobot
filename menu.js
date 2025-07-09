/**
 * Menu functions for UNION Cross-Chain Automation
 * Handles CLI menu navigation and script execution
 */

const inquirer = require('inquirer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

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
    console.log("3️⃣  SEI");
    console.log("4️⃣  Xion → Babylon");
    console.log("5️⃣  Xion → Osmosis");
    console.log("6️⃣  Babylon (Multi-destination)");
    console.log("7️⃣  Babylon → XION");
    console.log("8️⃣  SEI → BSC");
    console.log("9️⃣  CORN");
    console.log("🔟  Check for Updates");
    console.log("1️⃣1️⃣  Exit");
    // Display update notification only when update is actually available
    if (isUpdateAvailable === true && latestVersion && latestVersion.version) {
        console.log(`\n⚠️ New Update Available: v${latestVersion.version} (Select 10 to update)`);
    }
    console.log();
}

async function getUserInput(prompt) {
    const { answer } = await inquirer.prompt([
        {
            type: 'input',
            name: 'answer',
            message: prompt,
        }
    ]);
    return answer.trim();
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
    const choice = await getUserInput("👉 Enter your choice (1-11): ");

    if (choice === "1") {
        await sepoliaToHoleskyMenu();
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "2") {
        await holeskyToSepoliaMenu();
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "3") {
        await seiMenu();
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "4") {
        await xionToBabylonMenu();
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "5") {
        await runScript('XionToOsmosisSimple.js');
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "6") {
        await runScript('BabylonToOthersTransfer.js');
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "7") {
        await runScript('BabylonToXionTransfer.js');
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "8") {
        await runScript('SeiToBscSeiTransfer.js');
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "9") {
        await cornMenu();
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "10") {
        const continueRunning = await checkVersionCallback();
        if (continueRunning) {
            await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
        }
    } else if (choice === "11") {
        console.log("\n👋 Goodbye!");
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

async function seiMenu() {
    console.clear();
    console.log("\n🌾 SEI: Select Destination");
    console.log("1️⃣  CORN");
    console.log("2️⃣  XION");
    console.log("3️⃣  Back\n");
    const destination = await getUserInput("👉 Enter your choice (1-3): ");
    switch (destination) {
        case "1":
            await seiToCornMenu();
            break;
        case "2":
            await seiToXionMenu();
            break;
        case "3":
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(seiMenu, 1500);
    }
}

async function seiToCornMenu() {
    console.clear();
    console.log("\n🌾 SEI → CORN: Select Token");
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

async function seiToXionMenu() {
    console.clear();
    console.log("\n🌾 SEI → XION: Select Token");
    console.log("1️⃣  SEI");
    console.log("2️⃣  Back\n");
    const token = await getUserInput("👉 Enter your choice (1-2): ");
    switch (token) {
        case "1":
            await runScript('SeiToXionSEITransfer.js');
            break;
        case "2":
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(seiToXionMenu, 1500);
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

async function cornMenu() {
    console.clear();
    console.log("\n🌽 CORN: Select Destination");
    console.log("1️⃣  SEI");
    console.log("2️⃣  Back\n");
    const destination = await getUserInput("👉 Enter your choice (1-2): ");
    switch (destination) {
        case "1":
            await cornToSeiMenu();
            break;
        case "2":
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(cornMenu, 1500);
    }
}

async function cornToSeiMenu() {
    console.clear();
    console.log("\n🌽 CORN → SEI: Select Token");
    console.log("1️⃣  BTCN");
    console.log("2️⃣  Back\n");
    const token = await getUserInput("👉 Enter your choice (1-2): ");
    switch (token) {
        case "1":
            await runScript('CronToSeiBtcnTransfer.js');
            break;
        case "2":
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(cornToSeiMenu, 1500);
    }
}

module.exports = {
    mainMenu,
    getUserInput // Exported for use in index.js
};
