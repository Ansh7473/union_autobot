/**
 * Sepolia to Holesky Cross-Chain Transfer Hub
 * Routes to ETH, LINK, EURC, and USDC transfer scripts with auto-update feature
 */

const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const Table = require('cli-table3');
const fs = require('fs').promises;
const moment = require('moment-timezone');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ============= Version Check and Update Functions =============
const CURRENT_VERSION = '1.0.0';
const REPO_OWNER = 'Ansh7473';
const REPO_NAME = 'UNION-AUTO_BOT';
const VERSION_FILE = 'versions.json';
const EXCLUDED_FILES = ['private_keys.txt'];

async function fetchVersionsJson() {
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${VERSION_FILE}`;
    const headers = {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
    };

    try {
        const response = await axios.get(url, { headers });
        if (response.status === 200) {
            let data = response.data;
            if (typeof data === 'string') {
                data = data.replace(/\s+/g, ' ').replace(/,]/g, ']').replace(/,}/g, '}');
                data = JSON.parse(data);
            }
            return data.map(version => ({
                version: version.VERSION,
                update_date: moment(version.UPDATE_DATE).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss z'),
                changes: version.CHANGES
            }));
        } else {
            console.log(`❌ Failed to fetch versions from GitHub (Status: ${response.status})`);
            if (response.status === 403) console.log('ℹ️ GitHub API rate limit exceeded');
            if (response.status === 404) console.log('ℹ️ Version file (versions.json) not found');
            return [];
        }
    } catch (error) {
        console.log(`❌ Error fetching versions: ${error.message}`);
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            console.log('💡 Check your network connection.');
        }
        return [];
    }
}

async function fetchRepoFiles() {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`;
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
    };

    try {
        const response = await axios.get(url, { headers });
        if (response.status === 200) {
            return response.data.filter(item => item.type === 'file').map(item => ({
                name: item.name,
                download_url: item.download_url
            }));
        } else {
            console.log(`❌ Failed to fetch repository files (Status: ${response.status})`);
            return [];
        }
    } catch (error) {
        console.log(`❌ Error fetching repository files: ${error.message}`);
        return [];
    }
}

async function downloadFile(file) {
    if (EXCLUDED_FILES.includes(file.name)) {
        console.log(`ℹ️ Skipping ${file.name} (excluded file)`);
        return;
    }

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
        };
        const response = await axios.get(file.download_url, { headers, responseType: 'arraybuffer' });
        if (response.status === 200) {
            await fs.writeFile(path.join(__dirname, file.name), response.data);
            console.log(`✅ Downloaded ${file.name}`);
        } else {
            console.log(`❌ Failed to download ${file.name} (Status: ${response.status})`);
        }
    } catch (error) {
        console.log(`❌ Error downloading ${file.name}: ${error.message}`);
    }
}

async function updateFiles() {
    const files = await fetchRepoFiles();
    if (!files.length) {
        console.log('❌ No files found to update.');
        return false;
    }

    console.log('\n📥 Downloading updated files...');
    for (const file of files) {
        await downloadFile(file);
    }
    console.log('✅ Update complete.');
    return true;
}

function formatVersionChanges(versions) {
    if (!versions || versions.length === 0) {
        console.log('ℹ️ No version information available.');
        return;
    }

    const table = new Table({
        head: ['Version', 'Update Date', 'Changes'],
        colWidths: [15, 25, 50],
        style: { head: ['cyan'], border: ['grey'] },
        wordWrap: true
    });

    versions.forEach((version, index) => {
        const changesStr = version.changes.map(change => `• ${change}`).join('\n');
        table.push([`✨ ${version.version}`, `📅 ${version.update_date}`, changesStr]);
        if (index < versions.length - 1) {
            table.push(['─'.repeat(12), '─'.repeat(22), '─'.repeat(47)]);
        }
    });

    console.log('\n📋 Available Updates:');
    console.log(table.toString());
    console.log();
}

async function checkVersion() {
    console.log('🔍 Checking for updates...');
    try {
        const versions = await fetchVersionsJson();
        if (!versions || versions.length === 0) {
            console.log('✅ Unable to check for updates. Continuing with current version.');
            console.log('Press Enter to return to the main menu...');
            await getUserInput('');
            return true;
        }

        versions.sort((a, b) => {
            const aParts = a.version.split('.').map(Number);
            const bParts = b.version.split('.').map(Number);
            for (let i = 0; i < 3; i++) {
                if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i]; // Descending order
            }
            return 0;
        });

        const latestVersion = versions[0];
        const currentVersionParts = CURRENT_VERSION.split('.').map(Number);
        const latestVersionParts = latestVersion.version.split('.').map(Number);

        let isLatest = true;
        for (let i = 0; i < 3; i++) {
            if (currentVersionParts[i] < latestVersionParts[i]) {
                isLatest = false;
                break;
            } else if (currentVersionParts[i] > latestVersionParts[i]) {
                break;
            }
        }

        if (!isLatest) {
            console.log(`⚠️ New version available: ${latestVersion.version}`);
            formatVersionChanges(versions);
            const answer = await getUserInput('👉 Do you want to update to the latest version? (y/n): ');
            if (answer.toLowerCase() === 'y') {
                await updateFiles();
                console.log('\nℹ️ Please restart the application to use the updated version.');
                console.log('Press Enter to return to the main menu...');
                await getUserInput('');
                return false;
            } else {
                console.log('ℹ️ Update skipped.');
                console.log('Press Enter to return to the main menu...');
                await getUserInput('');
                return false;
            }
        }

        console.log(`✅ You are running the latest version (${CURRENT_VERSION})`);
        console.log('Press Enter to return to the main menu...');
        await getUserInput('');
        return true;
    } catch (error) {
        console.log(`❌ Error checking version: ${error.message}`);
        console.log('Press Enter to return to the main menu...');
        await getUserInput('');
        return true;
    }
}

// ============= Menu Interface =============
function displayBanner() {
    console.clear();
    console.log("\n🌉 ========================================== 🌉");
    console.log("  UNION Cross-Chain Automation");
    console.log("🌉 ========================================== 🌉\n");
}

function displayMainMenu() {
    console.log("🔹 Select an Option:");
    console.log("1️⃣  Sepolia → Holesky");
    console.log("2️⃣  Holesky → Sepolia");
    console.log("3️⃣  Check for Updates");
    console.log("4️⃣  Exit\n");
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

        child.on('error', (error) => {
            console.log(`❌ Error running ${scriptName}: ${error.message}`);
            console.log('Press Enter to return to the menu...');
            getUserInput('').then(() => mainMenu());
        });

        child.on('exit', (code) => {
            if (code !== 0) {
                console.log(`⚠️ ${scriptName} exited with code ${code}`);
                console.log('Press Enter to return to the menu...');
                getUserInput('').then(() => mainMenu());
            } else {
                mainMenu();
            }
        });
    } catch (error) {
        console.log(`❌ Script ${scriptName} not found or inaccessible: ${error.message}`);
        console.log('Press Enter to return to the menu...');
        await getUserInput('');
        mainMenu();
    }
}

// ============= Hierarchical Menu =============
async function mainMenu() {
    displayBanner();
    displayMainMenu();
    const choice = await getUserInput("👉 Enter your choice (1-4): ");

    if (choice === "1") {
        await sepoliaToHoleskyMenu();
    } else if (choice === "2") {
        await holeskyToSepoliaMenu();
    } else if (choice === "3") {
        await checkVersion();
        mainMenu();
    } else if (choice === "4") {
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
            await runScript('SepoliaToHoleskyEth.js');
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
