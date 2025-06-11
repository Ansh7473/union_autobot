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

async function displayMainMenu(isUpdateAvailable, latestVersion) {
    // These indexes are still needed for the version check logic
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
    const { answer } = await inquirer.prompt([{
        type: 'input',
        name: 'answer',
        message: prompt
    }]);
    return answer.trim();
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

            child.on('exit', async (code) => {
                if (code !== 0) {
                    console.log(`⚠️ ${scriptName} exited with code ${code}`);
                } else {
                    console.log(`✅ ${scriptName} completed successfully`);
                }
                await inquirer.prompt([{
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter to return to the menu...'
                }]);
                resolve();
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
            child.on('error', async (error) => {
                console.log(`❌ Error running ${scriptName}: ${error.message}`);
                await inquirer.prompt([{
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter to return to the menu...'
                }]);
                resolve();
            });
            child.on('exit', async (code) => {
                if (code !== 0) {
                    console.log(`⚠️ ${scriptName} exited with code ${code}`);
                    await inquirer.prompt([{
                        type: 'input',
                        name: 'continue',
                        message: 'Press Enter to return to the menu...'
                    }]);
                }
                resolve();
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
        const { choice } = await inquirer.prompt([{
            type: 'list',
            name: 'choice',
            message: 'Select an option:',
            choices: [
                { name: 'Sepolia → Holesky', value: 1 },
                { name: 'Holesky → Sepolia', value: 2 },
                { name: 'SEI Transfers', value: 3 },
                { name: 'XION ↔ BABYLON', value: 4 },
                { name: 'Check for Updates', value: 5 },
                { name: 'Exit', value: 6 }
            ]
        }]);
        const numChoice = choice;

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
    const { token } = await inquirer.prompt([{
        type: 'list',
        name: 'token',
        message: '🌉 Sepolia → Holesky: Select Token',
        choices: [
            { name: 'ETH', value: '1' },
            { name: 'LINK', value: '2' },
            { name: 'EURC', value: '3' },
            { name: 'USDC', value: '4' },
            { name: 'Back', value: '5' }
        ]
    }]);
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
            break;            default:
                console.log("\n❌ Invalid choice.");
                await inquirer.prompt([{
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter to continue...'
                }]);
                await sepoliaToHoleskyMenu();
    }
}

async function holeskyToSepoliaMenu() {
    console.clear();
    const { token } = await inquirer.prompt([{
        type: 'list',
        name: 'token',
        message: '🌉 Holesky → Sepolia: Select Token',
        choices: [
            { name: 'ETH', value: '1' },
            { name: 'LINK', value: '2' },
            { name: 'EURC', value: '3' },
            { name: 'USDC', value: '4' },
            { name: 'Back', value: '5' }
        ]
    }]);
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
    const { choice } = await inquirer.prompt([{
        type: 'list',
        name: 'choice',
        message: '🌉 SEI Transfers: Select Destination',
        choices: [
            { name: 'SEI → CORN', value: '1' },
            { name: 'SEI → XION', value: '2' },
            { name: 'Back', value: '3' }
        ]
    }]);
    
    switch (choice) {
        case "1":
            await seiToCornTokenMenu();
            break;
        case "2":
            await seiToXionTokenMenu();
            break;
        case "3":
            break;            default:
                console.log("\n❌ Invalid choice.");
                await inquirer.prompt([{
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter to continue...'
                }]);
                await seiToCornMenu();
    }
}

async function seiToCornTokenMenu() {
    console.clear();
    const { token } = await inquirer.prompt([{
        type: 'list',
        name: 'token',
        message: '🌉 SEI → CORN: Select Token',
        choices: [
            { name: 'SEI', value: '1' },
            { name: 'Back', value: '2' }
        ]
    }]);
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
    const { token } = await inquirer.prompt([{
        type: 'list',
        name: 'token',
        message: '🌉 SEI → XION: Select Token',
        choices: [
            { name: 'SEI', value: '1' },
            { name: 'Back', value: '2' }
        ]
    }]);
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
    const { token } = await inquirer.prompt([{
        type: 'list',
        name: 'token',
        message: '🌉 Xion → Babylon: Select Token',
        choices: [
            { name: 'USDC', value: '1' },
            { name: 'XION', value: '2' },
            { name: 'Back', value: '3' }
        ]
    }]);
    switch (token) {
        case "1":
            await runScriptWithArg('Xion_To_Babylon_XION_USDC.js', 'USDC');
            break;
        case "2":
            await runScriptWithArg('Xion_To_Babylon_XION_USDC.js', 'XION');
            break;            case "3":
                break;
            default:
                console.log("\n❌ Invalid choice.");
                await inquirer.prompt([{
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter to continue...'
                }]);
                await xionToBabylonMenu();
    }
}

async function handleTokenMenu(tokenType) {
    while (true) {
        const { choice } = await inquirer.prompt([{
            type: 'list',
            name: 'choice',
            message: `🔹 ${tokenType} Transfer Options:`,
            choices: [
                { name: 'Sepolia → Holesky', value: '1' },
                { name: 'Holesky → Sepolia', value: '2' },
                { name: 'Back to Main Menu', value: '3' }
            ]
        }]);

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
                console.log("❌ Invalid choice.");
                await inquirer.prompt([{
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter to continue...'
                }]);
        }
    }
}

// Clean up readline interface when process exits
process.on('SIGINT', () => {
    console.log('\n👋 Thanks for using UNION Cross-Chain Automation!');
    process.exit(0);
});

module.exports = {
    mainMenu,
    getUserInput // Exported for use in index.js
};
