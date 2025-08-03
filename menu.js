/**
 * Menu functions for UNION Cross-Chain Automation
 * Handles CLI menu navigation and script execution
 * Modified to ensure errors are visible and persistent
 */

const inquirer = require('inquirer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { createWriteStream } = require('fs');


const errorLogPath = path.join(__dirname, 'error.log');
const errorLogStream = createWriteStream(errorLogPath, { flags: 'a' });


function logErrorToFile(errorMessage) {
    const timestamp = new Date().toISOString();
    errorLogStream.write(`[${timestamp}] ${errorMessage}\n`);
}

// ============= Menu Interface =============
function displayBanner() {
    console.clear();
    
   
    const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
    };
    
    console.log(`\n${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
    console.log(`${colors.bright}${colors.green}🚀 UNION CROSS-CHAIN AUTOMATION BOT v3.0${colors.reset}`);
    console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
    
    
    console.log(`${colors.cyan}📋 Configuration:${colors.reset} ${colors.green}Multi-Chain Bridge${colors.reset} | ${colors.blue}Sepolia, Holesky, SEI, Xion, Babylon, BSC${colors.reset}`);
    
   
    console.log(`${colors.red}🚨 Setup:${colors.reset} ${colors.yellow}private_key.txt, xion.txt, BABYLON_ADDRESS.txt${colors.reset} ${colors.red}required!${colors.reset}`);
    
    console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);
}

function displayMainMenu(isUpdateAvailable, latestVersion) {
    // Enhanced colors
    const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
    };
    
 
    console.log(`${colors.bright}${colors.white}🎯 SELECT OPERATION MODE:${colors.reset}`);
    console.log();
   
   
    console.log(`  ${colors.green}${colors.bright}[1]${colors.reset} 🌉 ${colors.bright}${colors.white}Transfer${colors.reset} - Cross-chain token transfers`);
    console.log(`  ${colors.blue}${colors.bright}[2]${colors.reset} 📊 ${colors.bright}${colors.white}Union Account Checker${colors.reset} - Verify account status`);
    console.log(`  ${colors.magenta}${colors.bright}[3]${colors.reset} 🔄 ${colors.bright}${colors.white}Check for Updates${colors.reset} - Update bot to latest version`);
    console.log(`  ${colors.red}${colors.bright}[4]${colors.reset} 🚪 ${colors.bright}${colors.white}Exit${colors.reset} - Close the application`);
    
  
    if (isUpdateAvailable === true && latestVersion && latestVersion.version) {
        console.log(`\n${colors.bright}${colors.yellow}⚠️ NEW UPDATE AVAILABLE: v${latestVersion.version} (Select 3 to update)${colors.reset}`);
    }
    
    console.log(`\n${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
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
                logErrorToFile(errorMessage);
                console.log('⚠️ Error details saved to error.log');
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });

            child.on('exit', (code) => {
                if (code !== 0) {
                    const errorMessage = `⚠️ ${scriptName} exited with code ${code}`;
                    console.error(errorMessage);
                    logErrorToFile(errorMessage);
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
        logErrorToFile(errorMessage);
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
                logErrorToFile(errorMessage);
                console.log('⚠️ Error details saved to error.log');
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });

            child.on('exit', (code) => {
                if (code !== 0) {
                    const errorMessage = `⚠️ ${scriptName} exited with code ${code}`;
                    console.error(errorMessage);
                    logErrorToFile(errorMessage);
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
        logErrorToFile(errorMessage);
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
                logErrorToFile(errorMessage);
                console.log('⚠️ Error details saved to error.log');
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });

            child.on('exit', (code) => {
                if (code !== 0) {
                    const errorMessage = `⚠️ ${scriptName} exited with code ${code}`;
                    console.error(errorMessage);
                    logErrorToFile(errorMessage);
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
        logErrorToFile(errorMessage);
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
                logErrorToFile(errorMessage);
                console.log('⚠️ Error details saved to error.log');
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => resolve());
            });
            child.on('exit', (code) => {
                if (code !== 0) {
                    const errorMessage = `⚠️ ${scriptName} with arg ${arg} exited with code ${code}`;
                    console.error(errorMessage);
                    logErrorToFile(errorMessage);
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
        logErrorToFile(errorMessage);
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
    
    // Enhanced colors
    const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
    };
    
    const choice = await getUserInput(`${colors.yellow}👉 Enter your choice (1-4): ${colors.reset}`);

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
        console.log(`\n${colors.green}👋 Thank you for using UNION Cross-Chain Automation!${colors.reset}`);
        console.log(`${colors.cyan}🚀 Goodbye and happy bridging!${colors.reset}\n`);
        errorLogStream.end();
        process.exit(0);
    } else {
        console.log(`\n${colors.red}❌ Invalid choice. Please try again.${colors.reset}`);
        setTimeout(() => mainMenu(checkVersionCallback, isUpdateAvailable, latestVersion), 1500);
    }
}

async function transferMenu() {
    // Enhanced colors
    const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
    };
    
    console.log(`\n${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
    console.log(`${colors.bright}${colors.white}🌉 TRANSFER MENU - SELECT BLOCKCHAIN NETWORK${colors.reset}`);
    console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
    console.log(`${colors.green}[1]${colors.reset} 🔗 Sepolia → Holesky - Ethereum testnet bridge`);
    console.log(`${colors.green}[2]${colors.reset} 🔗 Holesky → Sepolia - Reverse Ethereum bridge`);
    console.log(`${colors.blue}[3]${colors.reset} 🌾 SEI Network - SEI ecosystem transfers`);
    console.log(`${colors.magenta}[4]${colors.reset} ⚡ Xion → Babylon - Cosmos to Bitcoin bridge`);
    console.log(`${colors.magenta}[5]${colors.reset} ⚡ Xion → Osmosis - Cosmos ecosystem bridge`);
    console.log(`${colors.yellow}[6]${colors.reset} 🏛️ Babylon (Multi-destination) - Bitcoin staking hub`);
    console.log(`${colors.yellow}[7]${colors.reset} 🏛️ Babylon → Sei - Bitcoin to SEI bridge`);
    console.log(`${colors.cyan}[8]${colors.reset} 🌾 SEI → BSC - Cross-chain to Binance`);
    console.log(`${colors.cyan}[9]${colors.reset} 🟡 BSC → SEI - Binance to SEI bridge`);
    console.log(`${colors.cyan}[10]${colors.reset} � BSC → Babylon - Binance to Bitcoin bridge`);
    console.log(`${colors.magenta}[11]${colors.reset} 🌌 Osmosis → Babylon - Cosmos DeFi to Bitcoin`);
    console.log(`${colors.yellow}[12]${colors.reset} 🌽 CORN Network - Agricultural blockchain`);
    console.log(`${colors.red}[13]${colors.reset} 🔙 Back to Main Menu`);
    console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);
    const choice = await getUserInput(`${colors.yellow}👉 Enter your choice (1-13): ${colors.reset}`);

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
            console.log(`\n${colors.red}❌ Invalid choice. Please try again.${colors.reset}`);
            setTimeout(transferMenu, 1500);
    }
}

async function sepoliaToHoleskyMenu() {
    // Enhanced colors
    const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
    };
    
    console.log(`\n${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
    console.log(`${colors.bright}${colors.white}🔗 SEPOLIA → HOLESKY - SELECT TOKEN TYPE${colors.reset}`);
    console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}`);
    console.log(`${colors.green}[1]${colors.reset} 💎 ETH - Native Ethereum transfer`);
    console.log(`${colors.blue}[2]${colors.reset} 🔗 LINK - Chainlink token bridge`);
    console.log(`${colors.yellow}[3]${colors.reset} 💶 EURC - Euro Coin stablecoin`);
    console.log(`${colors.magenta}[4]${colors.reset} 💵 USDC - USD Coin stablecoin`);
    console.log(`${colors.red}[5]${colors.reset} 🔙 Back to Transfer Menu`);
    console.log(`${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);
    const token = await getUserInput(`${colors.yellow}👉 Enter your choice (1-5): ${colors.reset}`);
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
            console.log(`\n${colors.red}❌ Invalid choice. Please try again.${colors.reset}`);
            setTimeout(sepoliaToHoleskyMenu, 1500);
    }
}

async function holeskyToSepoliaMenu() {
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
