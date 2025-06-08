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
    console.log("  UNION Cross-Chain Automation");
    console.log("🌉 ========================================== 🌉\n");
}

function displayMainMenu() {
    console.log("🔹 Select Token to Transfer:");
    console.log("1️⃣  ETH Transfer (Sepolia → Holesky)");
    console.log("2️⃣  LINK Token Transfer (Sepolia → Holesky)");
    console.log("3️⃣  EURC Token Transfer (Sepolia → Holesky)");
    console.log("4️⃣  USDC Token Transfer (Sepolia → Holesky)");
    console.log("5️⃣  ETH  Token Transfer (Holesky → Sepolia)");
    console.log("6️⃣  USDC Token Transfer (Holesky → Sepolia)");
    console.log("7️⃣  EURC Token Transfer (Holesky → Sepolia)");
    console.log("8️⃣  LINK Token Transfer (Holesky → Sepolia)");
    console.log("9️⃣  Exit\n");
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

// ============= New Hierarchical Menu =============
async function mainMenu() {
    displayBanner();
    console.log("1️⃣  Sepolia → Holesky");
    console.log("2️⃣  Holesky → Sepolia");
    console.log("3️⃣  Exit\n");
    const direction = await getUserInput("👉 Enter your choice (1-3): ");

    if (direction === "1") {
        await sepoliaToHoleskyMenu();
    } else if (direction === "2") {
        await holeskyToSepoliaMenu();
    } else if (direction === "3") {
        console.log("\n👋 Goodbye!");
        rl.close();
        process.exit(0);
    } else {
        console.log("\n❌ Invalid choice. Please try again.");
        setTimeout(mainMenu, 1500);
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
            mainMenu();
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
            rl.close();
            runScript('HoleskyToSepoliaETH.js');
            break;
        case "2":
            rl.close();
            runScript('HoleskyToSepoliaLink.js');
            break;
        case "3":
            rl.close();
            runScript('HoleskyToSepoliaEurc.js');
            break;
        case "4":
            rl.close();
            runScript('HoleskyToSepoliaUsdc.js');
            break;
        case "5":
            mainMenu();
            break;
        default:
            console.log("\n❌ Invalid choice. Please try again.");
            setTimeout(holeskyToSepoliaMenu, 1500);
    }
}

// Start the application
console.log("🚀 Starting Sepolia to Holesky Cross-Chain Transfer Hub...");
mainMenu().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
