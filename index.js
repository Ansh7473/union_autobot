/**
 * Sepolia to Holesky Cross-Chain Transfer Hub
 * Routes to ETH, LINK, and EURC transfer scripts
 */

const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ============= Menu Interface =============
function displayBanner() {
    console.clear();
    console.log("\n🌉 ========================================== 🌉");
    console.log("  Sepolia to Holesky Cross-Chain Transfer Hub");
    console.log("🌉 ========================================== 🌉\n");
}

function displayMainMenu() {
    console.log("🔹 Select Token to Transfer:");
    console.log("1️⃣  ETH Transfer");
    console.log("2️⃣  LINK Token Transfer");
    console.log("3️⃣  EURC Token Transfer");
    console.log("4️⃣  USDC Token Transfer");
    console.log("5️⃣  Exit\n");
}

async function getUserInput(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer.trim());
        });
    });
}

function runScript(scriptName) {
    // Use the absolute path to the script
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });

    child.on('exit', (code) => {
        // After the script exits, show the main menu again
        mainMenu();
    });
}

// ============= Main Menu Loop =============
async function mainMenu() {
    displayBanner();
    displayMainMenu();

    const input = await getUserInput("👉 Enter your choice (1-5): ");

    switch (input) {
        case "1":
            rl.close();
            runScript('SepoliaToHoleskyEth.js');
            break;
        case "2":
            rl.close();
            runScript('SepoliaToHoleskyLinkTransfer.js');
            break;
        case "3":
            rl.close();
            runScript('SepoliaToHoleskyEurcTransfer.js');
            break;
        case "4":
            rl.close();
            runScript('SepoliaToHoleskyUsdcTransfer.js');
            break;
        case "5":
            console.log("\n👋 Goodbye!");
            rl.close();
            process.exit(0);
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(mainMenu, 1500);
    }
}

// Start the application
console.log("🚀 Starting Sepolia to Holesky Cross-Chain Transfer Hub...");
mainMenu().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});