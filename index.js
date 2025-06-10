/**
 * Sepolia to Holesky Cross-Chain Transfer Hub
 * Handles version checking, updates, and starts the menu system
 * Updated for cleaner main menu notification
 */
const axios = require('axios');
const Table = require('cli-table3');
const fs = require('fs').promises;
const moment = require('moment-timezone');
const path = require('path');
const { mainMenu, getUserInput } = require('./menu.js');

// ============= Version Check and Update Functions =============
const CURRENT_VERSION = '1.0.0';
const REPO_OWNER = 'Ansh7473';
const REPO_NAME = 'UNION-AUTO_BOT';
const VERSION_FILE = 'versions.json';
const EXCLUDED_FILES = ['private_keys.txt'];

// Global variables for update notification
let latestVersion = null;
let isUpdateAvailable = false;

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
        await fs.writeFile(path.join(__dirname, file.name), response.data);
        console.log(`✅ Downloaded ${file.name}`);
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

async function checkVersion(showTable = false) {
    console.log('🔍 Checking for updates...');
    try {
        const versions = await fetchVersionsJson();
        if (!versions || versions.length === 0) {
            console.log('✅ Unable to check for updates. Continuing with current version.');
            if (showTable) {
                console.log('Press Enter to return to the main menu...');
                await getUserInput('');
            }
            return true;
        }

        versions.sort((a, b) => {
            const aParts = a.version.split('.').map(Number);
            const bParts = b.version.split('.').map(Number);
            for (let i = 0; i < 3; i++) {
                if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i];
            }
            return 0;
        });

        latestVersion = versions[0];
        const currentVersionParts = CURRENT_VERSION.split('.').map(Number);
        const latestVersionParts = latestVersion.version.split('.').map(Number);

        isUpdateAvailable = false;
        for (let i = 0; i < 3; i++) {
            if (currentVersionParts[i] < latestVersionParts[i]) {
                isUpdateAvailable = true;
                break;
            } else if (currentVersionParts[i] > latestVersionParts[i]) {
                break;
            }
        }

        if (isUpdateAvailable && showTable) {
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
        } else if (showTable) {
            console.log(`✅ You are running the latest version (${CURRENT_VERSION})`);
            console.log('Press Enter to return to the main menu...');
            await getUserInput('');
            return true;
        }

        return true;
    } catch (error) {
        console.log(`❌ Error checking version: ${error.message}`);
        if (showTable) {
            console.log('Press Enter to return to the main menu...');
            await getUserInput('');
        }
        return true;
    }
}

// Start the application
console.log("🚀 Starting Sepolia to Holesky Cross-Chain Transfer Hub...");
checkVersion().then((continueRunning) => {
    if (continueRunning) {
        mainMenu(checkVersion, isUpdateAvailable, latestVersion).catch((err) => {
            console.error("Fatal error:", err);
            process.exit(1);
        });
    }
});
