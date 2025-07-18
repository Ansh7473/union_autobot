
const axios = require('axios');
const Table = require('cli-table3');
const fs = require('fs').promises;
const moment = require('moment-timezone');
const path = require('path');
const { mainMenu, getUserInput } = require('./menu.js');

// ============= Version Check and Update Functions =============
// Read current version from local versions.json file
let CURRENT_VERSION = '1.0.0'; // Default fallback
try {
    const localVersionsPath = path.join(__dirname, 'versions.json');
    if (require('fs').existsSync(localVersionsPath)) {
        const localVersions = require('./versions.json');
        CURRENT_VERSION = localVersions[0].VERSION; // Get latest local version
    }
} catch (error) {
    console.log('Warning: Could not read local versions.json, using default version');
}

const REPO_OWNER = 'Ansh7473';
const REPO_NAME = 'UNION-AUTO_BOT';
const VERSION_FILE = 'versions.json';
const EXCLUDED_FOLDERS = ['node_modules', 'data'];

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

async function fetchRepoFiles(subPath = '') {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${subPath}`;
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
    };

    try {
        const response = await axios.get(url, { headers });
        if (response.status === 200) {
            let allFiles = [];
            
            for (const item of response.data) {
                if (item.type === 'file') {
                    // Add file with relative path
                    allFiles.push({
                        name: item.name,
                        path: subPath ? `${subPath}/${item.name}` : item.name,
                        download_url: item.download_url
                    });
                } else if (item.type === 'dir') {
                    // Skip node_modules completely
                    if (item.name === 'node_modules') {
                        console.log(`ℹ️ Skipping excluded folder: ${item.name}`);
                        continue;
                    }
                    
                    // For data folder, check if it exists locally first (only at root level)
                    if (item.name === 'data' && subPath === '') {
                        const dataFolderPath = path.join(__dirname, 'data');
                        try {
                            await fs.access(dataFolderPath);
                            console.log(`ℹ️ Skipping data folder (exists locally)`);
                            continue;
                        } catch {
                            console.log(`📥 Data folder doesn't exist locally, will download`);
                        }
                    }
                    
                    // Recursively fetch files from subdirectory
                    const subDirPath = subPath ? `${subPath}/${item.name}` : item.name;
                    const subFiles = await fetchRepoFiles(subDirPath);
                    allFiles = allFiles.concat(subFiles);
                }
            }
            
            return allFiles;
        } else {
            console.log(`❌ Failed to fetch repository files from ${subPath || 'root'} (Status: ${response.status})`);
            return [];
        }
    } catch (error) {
        console.log(`❌ Error fetching repository files from ${subPath || 'root'}: ${error.message}`);
        return [];
    }
}

async function downloadFile(file) {
    try {
        // Create directory if it doesn't exist
        const filePath = path.join(__dirname, file.path);
        const dirPath = path.dirname(filePath);
        
        // Create directory recursively if it doesn't exist
        await fs.mkdir(dirPath, { recursive: true });
        
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
        };
        const response = await axios.get(file.download_url, { headers, responseType: 'arraybuffer' });
        await fs.writeFile(filePath, response.data);
        console.log(`✅ Downloaded ${file.path}`);
    } catch (error) {
        console.log(`❌ Error downloading ${file.path}: ${error.message}`);
    }
}

async function getLocalFiles(subPath = '') {
    try {
        const currentPath = path.join(__dirname, subPath);
        const items = await fs.readdir(currentPath, { withFileTypes: true });
        let allFiles = [];
        
        for (const item of items) {
            const itemPath = subPath ? `${subPath}/${item.name}` : item.name;
            
            if (item.isFile()) {
                // Include all files except those in excluded folders
                const folderName = itemPath.split('/')[0];
                if (folderName !== 'node_modules' && folderName !== 'data') {
                    allFiles.push(itemPath);
                }
            } else if (item.isDirectory()) {
                // Skip node_modules completely
                if (item.name === 'node_modules') {
                    console.log(`ℹ️ Skipping excluded folder during scan: ${item.name}`);
                    continue;
                }
                
                // Skip data folder during scan (it's protected)
                if (item.name === 'data') {
                    console.log(`ℹ️ Skipping data folder during scan (protected)`);
                    continue;
                }
                
                // Recursively get files from subdirectory
                const subFiles = await getLocalFiles(itemPath);
                allFiles = allFiles.concat(subFiles);
            }
        }
        
        return allFiles;
    } catch (error) {
        console.log(`❌ Error reading local files from ${subPath || 'root'}: ${error.message}`);
        return [];
    }
}

async function deleteLocalFile(filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        await fs.unlink(fullPath);
        console.log(`🗑️ Deleted ${filePath}`);
    } catch (error) {
        console.log(`❌ Error deleting ${filePath}: ${error.message}`);
    }
}

async function updateFiles() {
    console.log('\n🔍 Fetching remote file list (including subdirectories)...');
    const remoteFiles = await fetchRepoFiles();
    if (!remoteFiles.length) {
        console.log('❌ No files found to update.');
        return false;
    }

    console.log('📂 Getting local file list (including subdirectories)...');
    const localFiles = await getLocalFiles();
    
    // Get list of remote file paths
    const remoteFilePaths = remoteFiles.map(file => file.path);
    
    // Find files that exist locally but not remotely (should be deleted)
    const filesToDelete = localFiles.filter(localFile => 
        !remoteFilePaths.includes(localFile)
    );
    
    // Delete obsolete files
    if (filesToDelete.length > 0) {
        console.log('\n🗑️ Removing obsolete files...');
        for (const fileToDelete of filesToDelete) {
            await deleteLocalFile(fileToDelete);
        }
    }

    // Download new/updated files
    console.log('\n📥 Downloading updated files...');
    for (const file of remoteFiles) {
        await downloadFile(file);
    }
    
    console.log('\n✅ Update complete.');
    console.log(`📊 Summary:`);
    console.log(`   📥 Downloaded/Updated: ${remoteFiles.length} files`);
    console.log(`   🗑️ Deleted: ${filesToDelete.length} files`);
    console.log(`   📁 Directories processed: chains/, utils/, and root`);
    console.log(`   🚫 Excluded folders: ${EXCLUDED_FOLDERS.join(', ')} (only downloaded if missing)`);
    
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
        // Always fetch from GitHub API to get the latest remote versions
        const versions = await fetchVersionsJson();
        
        if (!versions || versions.length === 0) {
            console.log('✅ Unable to check for updates. Continuing with current version.');
            // Ensure update flags are properly set when no version info is available
            isUpdateAvailable = false;
            latestVersion = null;
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

        // Compare versions: check if current version is lower than latest
        isUpdateAvailable = false;
        for (let i = 0; i < 3; i++) {
            if (currentVersionParts[i] < latestVersionParts[i]) {
                isUpdateAvailable = true;
                break;
            } else if (currentVersionParts[i] > latestVersionParts[i]) {
                // Current version is newer than latest (shouldn't happen normally)
                isUpdateAvailable = false;
                break;
            }
            // If equal, continue to next part
        }

        // Debug info (can be removed later)
        console.log(`📦 Current version (local versions.json): ${CURRENT_VERSION}`);
        console.log(`🆕 Latest version (GitHub API): ${latestVersion.version}`);
        console.log(`🔄 Update available: ${isUpdateAvailable}`);

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
        // Ensure update flags are properly set on error
        isUpdateAvailable = false;
        latestVersion = null;
        if (showTable) {
            console.log('Press Enter to return to the main menu...');
            await getUserInput('');
        }
        return true;
    }
}

// Start the application
console.log("🚀 Starting Cross-Chain Transfer Hub...");
checkVersion(false).then((continueRunning) => {
    if (continueRunning) {
        // Pass the actual values after initial check
        mainMenu((showTable = true) => checkVersion(showTable), isUpdateAvailable, latestVersion).catch((err) => {
            console.error("Fatal error:", err);
            process.exit(1);
        });
    }
});
