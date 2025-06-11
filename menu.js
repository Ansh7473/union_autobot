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

async function displayMainMenu(isUpdateAvailable, latestVersion) {
    console.log("🔹 Select Chain and Token:");
    console.log("1️⃣  Sepolia → Holesky");
    console.log("2️⃣  Holesky → Sepolia");
    console.log("3️⃣  SEI Transfers");
    console.log("4️⃣  XION ↔ BABYLON");
    console.log("5️⃣  Check for Updates");
    console.log("6️⃣  Exit\n");

    const updateIndex = 5;
    const exitIndex = 6;

    // Display update notification if available
    if (isUpdateAvailable && latestVersion) {
        console.log(`\n⚠️ New Update Available: v${latestVersion.version}`);
        console.log(`Select ${updateIndex} to update and get new features!`);
    }
    console.log();

    return { updateIndex, exitIndex };
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
        console.log(`🚀 Running ${scriptName}...`);
        
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
                } else {
                    console.log(`✅ ${scriptName} completed successfully`);
                }
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });
        });
    } catch (error) {
        console.log(`❌ Script ${scriptName} not found or inaccessible: ${error.message}`);
        console.log('Press Enter to return to the menu...');
        await getUserInput('');
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
    while (true) {
        displayBanner();
        const { updateIndex, exitIndex } = await displayMainMenu(isUpdateAvailable, latestVersion);
        const choice = await getUserInput('Enter your choice: ');
        const numChoice = parseInt(choice);

        if (numChoice === exitIndex) {
            console.log('👋 Thanks for using UNION Cross-Chain Automation!');
            process.exit(0);
        } else if (numChoice === updateIndex) {
            await checkVersionCallback(true);
        } else {
            switch(numChoice) {
                case 1:
                    await sepoliaToHoleskyMenu();
                    break;
                case 2:
                    await holeskyToSepoliaMenu();
                    break;
                case 3:
                    await seiToCornMenu();
                    break;
                case 4:
                    await xionToBabylonMenu();
                    break;
                default:
                    console.log('❌ Invalid choice. Please try again.');
                    await getUserInput('Press Enter to continue...');
            }
        }
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
    console.log("\n🌉 SEI Transfers: Select Destination");
    console.log("1️⃣  SEI → CORN");
    console.log("2️⃣  SEI → XION");
    console.log("3️⃣  Back\n");
    const choice = await getUserInput("👉 Enter your choice (1-3): ");
    
    switch (choice) {
        case "1":
            await seiToCornTokenMenu();
            break;
        case "2":
            await seiToXionTokenMenu();
            break;
        case "3":
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(seiToCornMenu, 1500);
    }
}

async function seiToCornTokenMenu() {
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
            setTimeout(seiToCornTokenMenu, 1500);
    }
}

async function seiToXionTokenMenu() {
    console.clear();
    console.log("\n🌉 SEI → XION: Select Token");
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
            setTimeout(seiToXionTokenMenu, 1500);
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

async function handleTokenMenu(tokenType) {
    while (true) {
        console.log(`\n🔹 ${tokenType} Transfer Options:`);
        console.log("1️⃣  Sepolia → Holesky");
        console.log("2️⃣  Holesky → Sepolia");
        console.log("3️⃣  Back to Main Menu");
        console.log();

        const choice = await getUserInput("👉 Enter your choice (1-3): ");

        switch(choice) {
            case "1":
                console.log(`\n🚀 Starting Sepolia to Holesky ${tokenType} transfer...`);
                await runScript(`SepoliaToHolesky${tokenType}Transfer.js`);
                break;
            case "2":
                console.log(`\n🚀 Starting Holesky to Sepolia ${tokenType} transfer...`);
                await runScript(`HoleskyToSepolia${tokenType}.js`);
                break;
            case "3":
                return;
            default:
                console.log("❌ Invalid choice. Please try again.");
                await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
}

module.exports = {
    mainMenu,
    getUserInput // Exported for use in index.js
};
