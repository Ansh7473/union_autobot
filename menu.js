/**
 * Menu functions for UNION Cross-Chain Automation
 * Handles CLI menu navigation and script execution
 * Modified to ensure errors are visible and persistent
 */

const inquirer = require('inquirer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { createWriteStream } = require('fs'); // Added for error logging

// ============= Error Logging Setup =============
const errorLogPath = path.join(__dirname, 'error.log');
const errorLogStream = createWriteStream(errorLogPath, { flags: 'a' });

// Function to log errors to file
function logErrorToFile(errorMessage) {
    const timestamp = new Date().toISOString();
    errorLogStream.write(`[${timestamp}] ${errorMessage}\n`);
}

// ============= Menu Interface =============
function displayBanner() {
    console.clear();
    console.log("\n🌉 ========================================== 🌉");
    console.log("  UNION Cross-Chain Automation");
    console.log("🌉 ========================================== 🌉\n");
}

function displayMainMenu(isUpdateAvailable, latestVersion) {
    console.log("🔹 Select an Option:");
    console.log("1️⃣  Transfer");
    console.log("2️⃣  Union Account Checker");
    console.log("3️⃣  Check for Updates");
    console.log("4️⃣  Exit");
    if (isUpdateAvailable === true && latestVersion && latestVersion.version) {
        console.log(`\n⚠️ New Update Available: v${latestVersion.version} (Select 4 to update)`);
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

async function runRootScript(scriptName) {
    const scriptPath = path.join(__dirname, scriptName);
    try {
        await fs.access(scriptPath);
        const child = spawn('node', [scriptPath], { stdio: ['inherit', 'inherit', 'inherit'] });

        return new Promise((resolve) => {
            child.on('error', (error) => {
                const errorMessage = `❌ Error running ${scriptName}: ${error.message}`;
                console.error(errorMessage);
                logErrorToFile(errorMessage); // Log to file
                console.log('⚠️ Error details saved to error.log');
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });

            child.on('exit', (code) => {
                if (code !== 0) {
                    const errorMessage = `⚠️ ${scriptName} exited with code ${code}`;
                    console.error(errorMessage);
                    logErrorToFile(errorMessage); // Log to file
                    console.log('⚠️ Error details saved to error.log');
                    console.log('Press Enter to return to the menu...');
                    getUserInput('').then(() => resolve());
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        const errorMessage = `❌ Script ${scriptName} not found or inaccessible: ${error.message}`;
        console.error(errorMessage);
        logErrorToFile(errorMessage); // Log to file
        console.log('⚠️ Error details saved to error.log');
        console.log('Press Enter to return to the menu...');
        await getUserInput('');
        return;
    }
}

async function runUtilScript(scriptName) {
    const scriptPath = path.join(__dirname, 'utils', scriptName);
    try {
        await fs.access(scriptPath);
        const child = spawn('node', [scriptPath], { stdio: ['inherit', 'inherit', 'inherit'] });

        return new Promise((resolve) => {
            child.on('error', (error) => {
                const errorMessage = `❌ Error running ${scriptName}: ${error.message}`;
                console.error(errorMessage);
                logErrorToFile(errorMessage); // Log to file
                console.log('⚠️ Error details saved to error.log');
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });

            child.on('exit', (code) => {
                if (code !== 0) {
                    const errorMessage = `⚠️ ${scriptName} exited with code ${code}`;
                    console.error(errorMessage);
                    logErrorToFile(errorMessage); // Log to file
                    console.log('⚠️ Error details saved to error.log');
                    console.log('Press Enter to return to the menu...');
                    getUserInput('').then(() => resolve());
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        const errorMessage = `❌ Script ${scriptName} not found or inaccessible: ${error.message}`;
        console.error(errorMessage);
        logErrorToFile(errorMessage); // Log to file
        console.log('⚠️ Error details saved to error.log');
        console.log('Press Enter to return to the menu...');
        await getUserInput('');
        return;
    }
}

async function runScript(scriptName) {
    const scriptPath = path.join(__dirname, 'chains', scriptName);
    try {
        await fs.access(scriptPath);
        const child = spawn('node', [scriptPath], { stdio: ['inherit', 'inherit', 'inherit'] });

        return new Promise((resolve) => {
            child.on('error', (error) => {
                const errorMessage = `❌ Error running ${scriptName}: ${error.message}`;
                console.error(errorMessage);
                logErrorToFile(errorMessage); // Log to file
                console.log('⚠️ Error details saved to error.log');
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });

            child.on('exit', (code) => {
                if (code !== 0) {
                    const errorMessage = `⚠️ ${scriptName} exited with code ${code}`;
                    console.error(errorMessage);
                    logErrorToFile(errorMessage); // Log to file
                    console.log('⚠️ Error details saved to error.log');
                    console.log('Press Enter to return to the menu...');
                    getUserInput('').then(() => resolve());
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        const errorMessage = `❌ Script ${scriptName} not found or inaccessible: ${error.message}`;
        console.error(errorMessage);
        logErrorToFile(errorMessage); // Log to file
        console.log('⚠️ Error details saved to error.log');
        console.log('Press Enter to return to the menu...');
        await getUserInput('');
        return;
    }
}

async function runScriptWithArg(scriptName, arg) {
    const scriptPath = path.join(__dirname, 'chains', scriptName);
    try {
        await fs.access(scriptPath);
        const child = spawn('node', [scriptPath, arg], { stdio: ['inherit', 'inherit', 'inherit'] });
        return new Promise((resolve) => {
            child.on('error', (error) => {
                const errorMessage = `❌ Error running ${scriptName} with arg ${arg}: ${error.message}`;
                console.error(errorMessage);
                logErrorToFile(errorMessage); // Log to file
                console.log('⚠️ Error details saved to error.log');
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });
            child.on('exit', (code) => {
                if (code !== 0) {
                    const errorMessage = `⚠️ ${scriptName} with arg ${arg} exited with code ${code}`;
                    console.error(errorMessage);
                    logErrorToFile(errorMessage); // Log to file
                    console.log('⚠️ Error details saved to error.log');
                    console.log('Press Enter to return to the menu...');
                    getUserInput('').then(() => resolve());
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        const errorMessage = `❌ Script ${scriptName} not found or inaccessible: ${error.message}`;
        console.error(errorMessage);
        logErrorToFile(errorMessage); // Log to file
        console.log('⚠️ Error details saved to error.log');
        console.log('Press Enter to return to the menu...');
        await getUserInput('');
        return;
    }
}

// ============= Hierarchical Menu =============
async function mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion) {
    displayBanner();
    displayMainMenu(isUpdateAvailable, latestVersion);
    const choice = await getUserInput("👉 Enter your choice (1-4): ");

    if (choice === "1") {
        await transferMenu();
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "2") {
        await runUtilScript('UnionAccountChecker.js');
        await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
    } else if (choice === "3") {
        const continueRunning = await checkVersionCallback();
        if (continueRunning) {
            await mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion);
        }
    } else if (choice === "4") {
        console.log("\n👋 Goodbye!");
        errorLogStream.end(); // Close error log stream
        process.exit(0);
    } else {
        console.log("\n❌ Invalid choice. Please try again.");
        setTimeout(() => mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion), 1500);
    }
}

async function transferMenu() {
    // Avoid clearing console here to preserve potential error messages
    console.log("\n🌉 Transfer Menu: Select Chain");
    console.log("1️⃣  Sepolia → Holesky");
    console.log("2️⃣  Holesky → Sepolia");
    console.log("3️⃣  SEI");
    console.log("4️⃣  Xion → Babylon");
    console.log("5️⃣  Xion → Osmosis");
    console.log("6️⃣  Babylon (Multi-destination)");
    console.log("7️⃣  Babylon → Sei");
    console.log("8️⃣  SEI → BSC");
    console.log("9️⃣  BSC → SEI");
    console.log("🔟  BSC → Babylon");
    console.log("1️⃣1️⃣  Osmosis → Babylon");
    console.log("1️⃣2️⃣  CORN");
    console.log("1️⃣3️⃣  Back\n");
    const choice = await getUserInput("👉 Enter your choice (1-13): ");

    switch (choice) {
        case "1":
            await sepoliaToHoleskyMenu();
            break;
        case "2":
            await holeskyToSepoliaMenu();
            break;
        case "3":
            await seiMenu();
            break;
        case "4":
            await xionToBabylonMenu();
            break;
        case "5":
            await runScript('XionToOsmosisSimple.js');
            break;
        case "6":
            await runScript('BabylonToOthersTransfer.js');
            break;
        case "7":
            await runScript('BabylonToSeiTransfer.js');
            break;
        case "8":
            await runScript('SeiToBscSeiTransfer.js');
            break;
        case "9":
            await runScript('BscToSeiTransfer.js');
            break;
        case "10":
            await runScript('BscToBabylonTransfer.js');
            break;
        case "11":
            await runScript('OsmosisToBabylonTransfer.js');
            break;
        case "12":
            await cornMenu();
            break;
        case "13":
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(transferMenu, 1500);
    }
}

async function sepoliaToHoleskyMenu() {
    // Avoid clearing console here
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
    // Avoid clearing console here
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
    // Avoid clearing console here
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
    // Avoid clearing console here
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
    // Avoid clearing console here
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
    // Avoid clearing console here
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
    // Avoid clearing console here
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
    // Avoid clearing console here
    console.log("\n🌽 CORN → SEI: Select Token");
    console.log("1️⃣  BTCN");
    console.log("2️⃣  Back\n");
    const token = await getUserInput("👉 Enter your choice (1-2): ");
    switch (token) {
        case "1":
            await runScript('CornToSeiBtcnTransfer.js');
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
    getUserInput
};
