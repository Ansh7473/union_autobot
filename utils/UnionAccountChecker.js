//STILL NEED BETTER FIX 




// ============= External Dependencies =============
const axios = require('axios');
const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ============= JWT Management =============
const JWT_FILE_PATH = path.join(__dirname, '../data/jwt.json');

// Default JWT configuration - will be loaded from jwt.json
let CURRENT_JWT_TOKEN = null;

async function loadJWTAccounts() {
    try {
        const data = await fs.readFile(JWT_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, create empty structure
        console.log("📄 No jwt.json file found. Creating new account structure...");
        const defaultAccounts = {
            accounts: []
        };
        await saveJWTAccounts(defaultAccounts);
        return defaultAccounts;
    }
}

async function saveJWTAccounts(accounts) {
    try {
        await fs.writeFile(JWT_FILE_PATH, JSON.stringify(accounts, null, 2));
    } catch (error) {
        console.error("❌ Error saving JWT accounts:", error.message);
    }
}

function extractUserInfoFromJWT(jwtToken) {
    try {
        const token = jwtToken.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            userId: payload.sub,
            email: payload.email,
            fullName: payload.user_metadata?.full_name || payload.user_metadata?.name || 'Unknown',
            username: payload.user_metadata?.preferred_username || payload.user_metadata?.user_name || 'Unknown',
            exp: payload.exp,
            sessionId: payload.session_id
        };
    } catch (error) {
        console.error("❌ Error parsing JWT token:", error.message);
        return null;
    }
}

// JWT Refresh Functionality
async function refreshJWTToken(refreshToken) {
    try {
        console.log("🔄 Refreshing JWT token...");
        
        const response = await axios.post('https://uorqzpuryrgfnecadajo.supabase.co/auth/v1/token', {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcnF6cHVyeXJnZm5lY2FkYWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4NzIwNzMsImV4cCI6MjA0MjQ0ODA3M30.JEeBbMtWJfZGnxVXlvbN4J1KxCRMSPzjrGEzXUYYLSM'
            }
        });
        
        if (response.data.access_token) {
            console.log("✅ JWT token refreshed successfully!");
            return `Bearer ${response.data.access_token}`;
        } else {
            console.log("❌ Failed to refresh JWT token");
            return null;
        }
    } catch (error) {
        console.error("❌ Error refreshing JWT token:", error.message);
        return null;
    }
}

async function checkAndRefreshToken(accountIndex = null) {
    try {
        const accounts = await loadJWTAccounts();
        let account;
        
        if (accountIndex !== null) {
            account = accounts.accounts[accountIndex];
        } else {
            account = accounts.accounts.find(acc => acc.isActive);
        }
        
        if (!account) {
            console.log("❌ No active account found");
            return false;
        }
        
        const userInfo = extractUserInfoFromJWT(account.jwt);
        if (!userInfo) {
            console.log("❌ Invalid JWT token");
            return false;
        }
        
        // Check if token expires in next 5 minutes (300 seconds)
        const now = Date.now() / 1000;
        const timeToExpiry = userInfo.exp - now;
        
        if (timeToExpiry <= 300) {
            console.log(`⚠️  Token expires in ${Math.round(timeToExpiry / 60)} minutes. Attempting refresh...`);
            
            // Try to refresh using the refresh token stored in the account
            if (account.refreshToken) {
                const newToken = await refreshJWTToken(account.refreshToken);
                if (newToken) {
                    // Update the account with new token
                    account.jwt = newToken;
                    account.lastRefreshed = new Date().toISOString();
                    await saveJWTAccounts(accounts);
                    
                    // Update current JWT token if this is the active account
                    if (account.isActive) {
                        CURRENT_JWT_TOKEN = newToken;
                    }
                    
                    console.log("✅ Token refreshed successfully!");
                    return true;
                } else {
                    console.log("❌ Failed to refresh token. Please login again.");
                    return false;
                }
            } else {
                console.log("❌ No refresh token available. Please login again.");
                return false;
            }
        } else {
            console.log(`✅ Token is valid for ${Math.round(timeToExpiry / 60)} minutes - no refresh needed`);
            return true;
        }
    } catch (error) {
        console.error("❌ Error checking token:", error.message);
        return false;
    }
}

function isTokenExpired(jwtToken) {
    try {
        const userInfo = extractUserInfoFromJWT(jwtToken);
        if (!userInfo) return true;
        
        const now = Date.now() / 1000;
        return userInfo.exp <= now;
    } catch (error) {
        return true;
    }
}

function getTokenTimeToExpiry(jwtToken) {
    try {
        const userInfo = extractUserInfoFromJWT(jwtToken);
        if (!userInfo) return 0;
        
        const now = Date.now() / 1000;
        return Math.max(0, userInfo.exp - now);
    } catch (error) {
        return 0;
    }
}

async function displayAccountSelector() {
    console.clear();
    console.log("\n🎖️  ==================================== 🎖️");
    console.log("       Union Account Selector");
    console.log("🎖️  ==================================== 🎖️\n");
    
    const accounts = await loadJWTAccounts();
    
    if (accounts.accounts.length === 0) {
        console.log("❌ No accounts found.");
        console.log("\n🔹 Options:");
        console.log("1️⃣  Add New Account");
        console.log("2️⃣  Exit");
        
        const choice = await getUserInput("\n👉 Enter your choice (1-2): ");
        
        if (choice === "1") {
            return await addNewAccount();
        } else {
            console.log("👋 Goodbye!");
            return null;
        }
    }
    
    console.log("👥 Available Accounts:");
    console.log("=" .repeat(50));
    
    accounts.accounts.forEach((account, index) => {
        const activeIndicator = account.isActive ? "🟢 ACTIVE" : "⚪ INACTIVE";
        const userInfo = extractUserInfoFromJWT(account.jwt);
        const isExpired = isTokenExpired(account.jwt);
        const timeToExpiry = getTokenTimeToExpiry(account.jwt);
        
        let tokenStatus;
        if (isExpired) {
            tokenStatus = "❌ Expired";
        } else if (timeToExpiry <= 300) {
            tokenStatus = "⚠️  Expires Soon";
        } else {
            tokenStatus = "✅ Valid";
        }
        
        console.log(`${index + 1}️⃣  ${activeIndicator} ${account.displayName}`);
        console.log(`   👤 Username: ${account.username}`);
        console.log(`   🎫 Token: ${tokenStatus}`);
        if (!isExpired && timeToExpiry > 0) {
            console.log(`   ⏰ Expires in: ${Math.round(timeToExpiry / 60)} minutes`);
        }
        console.log(`   📅 Added: ${new Date(account.addedAt).toLocaleDateString()}`);
        if (account.lastRefreshed) {
            console.log(`   🔄 Last Refreshed: ${new Date(account.lastRefreshed).toLocaleDateString()}`);
        }
        if (userInfo) {
            console.log(`   📧 Email: ${userInfo.email}`);
            console.log(`   🆔 User ID: ${userInfo.userId}`);
        }
        console.log();
    });
    
    console.log("🔧 Management Options:");
    console.log(`${accounts.accounts.length + 1}️⃣  Add New Account`);
    console.log(`${accounts.accounts.length + 2}️⃣  Edit Account`);
    console.log(`${accounts.accounts.length + 3}️⃣  Delete Account`);
    console.log(`${accounts.accounts.length + 4}️⃣  Refresh Token`);
    console.log(`${accounts.accounts.length + 5}️⃣  Exit`);
    
    const choice = await getUserInput("\n👉 Select account or option: ");
    const choiceNum = parseInt(choice);
    
    if (choiceNum >= 1 && choiceNum <= accounts.accounts.length) {
        // Switch to selected account
        const selectedAccount = accounts.accounts[choiceNum - 1];
        
        // Check if token needs refresh
        if (isTokenExpired(selectedAccount.jwt)) {
            console.log("❌ Selected account has an expired token.");
            if (selectedAccount.refreshToken) {
                console.log("🔄 Attempting to refresh token...");
                const refreshed = await checkAndRefreshToken(choiceNum - 1);
                if (!refreshed) {
                    console.log("❌ Failed to refresh token. Please update it manually.");
                    await getUserInput("Press Enter to continue...");
                    return await displayAccountSelector();
                }
            } else {
                console.log("❌ No refresh token available. Please update it manually.");
                await getUserInput("Press Enter to continue...");
                return await displayAccountSelector();
            }
        }
        
        // Set all accounts to inactive
        accounts.accounts.forEach(acc => acc.isActive = false);
        
        // Set selected account as active
        selectedAccount.isActive = true;
        await saveJWTAccounts(accounts);
        
        // Update current JWT token
        CURRENT_JWT_TOKEN = selectedAccount.jwt.startsWith('Bearer ') ? selectedAccount.jwt : `Bearer ${selectedAccount.jwt}`;
        
        console.log(`✅ Switched to account: ${selectedAccount.displayName}`);
        await getUserInput("Press Enter to continue...");
        return selectedAccount;
    } else if (choiceNum === accounts.accounts.length + 1) {
        // Add new account
        return await addNewAccount();
    } else if (choiceNum === accounts.accounts.length + 2) {
        // Edit account
        return await editAccount();
    } else if (choiceNum === accounts.accounts.length + 3) {
        // Delete account
        return await deleteAccount();
    } else if (choiceNum === accounts.accounts.length + 4) {
        // Refresh token
        return await refreshTokenMenu();
    } else if (choiceNum === accounts.accounts.length + 5) {
        // Exit
        return null;
    } else {
        console.log("❌ Invalid choice. Please try again.");
        await getUserInput("Press Enter to continue...");
        return await displayAccountSelector();
    }
}

async function refreshTokenMenu() {
    console.clear();
    console.log("\n🔄 REFRESH TOKEN MENU");
    console.log("=" .repeat(50));
    
    const accounts = await loadJWTAccounts();
    
    if (accounts.accounts.length === 0) {
        console.log("❌ No accounts found.");
        await getUserInput("Press Enter to continue...");
        return await displayAccountSelector();
    }
    
    console.log("👥 Select account to refresh token:");
    console.log();
    
    accounts.accounts.forEach((account, index) => {
        const activeIndicator = account.isActive ? "🟢 ACTIVE" : "⚪ INACTIVE";
        const isExpired = isTokenExpired(account.jwt);
        const timeToExpiry = getTokenTimeToExpiry(account.jwt);
        
        let tokenStatus;
        if (isExpired) {
            tokenStatus = "❌ Expired";
        } else if (timeToExpiry <= 300) {
            tokenStatus = "⚠️  Expires Soon";
        } else {
            tokenStatus = "✅ Valid";
        }
        
        console.log(`${index + 1}️⃣  ${activeIndicator} ${account.displayName}`);
        console.log(`   🎫 Token: ${tokenStatus}`);
        if (!isExpired && timeToExpiry > 0) {
            console.log(`   ⏰ Expires in: ${Math.round(timeToExpiry / 60)} minutes`);
        }
        console.log(`   🔄 Refresh Token: ${account.refreshToken ? "✅ Available" : "❌ Not Available"}`);
        console.log();
    });
    
    console.log(`${accounts.accounts.length + 1}️⃣  Back to Account Selector`);
    
    const choice = await getUserInput("\n👉 Select account to refresh: ");
    const choiceNum = parseInt(choice);
    
    if (choiceNum >= 1 && choiceNum <= accounts.accounts.length) {
        const selectedAccount = accounts.accounts[choiceNum - 1];
        
        if (!selectedAccount.refreshToken) {
            console.log("❌ No refresh token available for this account.");
            console.log("💡 You need to add a refresh token to enable automatic token refresh.");
            
            const addRefreshToken = await getUserInput("Would you like to add a refresh token? (y/n): ");
            if (addRefreshToken.toLowerCase() === 'y') {
                const refreshToken = await getUserInput("Enter refresh token: ");
                if (refreshToken.trim()) {
                    selectedAccount.refreshToken = refreshToken.trim();
                    await saveJWTAccounts(accounts);
                    console.log("✅ Refresh token added successfully!");
                }
            }
            
            await getUserInput("Press Enter to continue...");
            return await refreshTokenMenu();
        }
        
    console.log("🔧 Refresh Options:");
    console.log("1️⃣  Auto Refresh (only if token expires soon)");
    console.log("2️⃣  Force Refresh (refresh even if token is valid)");
    console.log("3️⃣  Back to Account Selector");
    
    const refreshChoice = await getUserInput("\n👉 Select refresh option: ");
    
    if (refreshChoice === "1") {
        console.log(`🔄 Auto-refreshing token for ${selectedAccount.displayName}...`);
        const refreshed = await checkAndRefreshToken(choiceNum - 1);
        
        if (refreshed) {
            // Check if token was actually refreshed or just validated
            const updatedAccounts = await loadJWTAccounts();
            const updatedAccount = updatedAccounts.accounts[choiceNum - 1];
            
            if (updatedAccount.lastRefreshed && new Date(updatedAccount.lastRefreshed).getTime() > Date.now() - 10000) {
                console.log("✅ Token was refreshed with a new token!");
            } else {
                console.log("✅ Token validation completed - token is still valid!");
            }
            
            // If this was the active account, update the current JWT token
            if (selectedAccount.isActive) {
                CURRENT_JWT_TOKEN = updatedAccount.jwt.startsWith('Bearer ') ? updatedAccount.jwt : `Bearer ${updatedAccount.jwt}`;
            }
        } else {
            console.log("❌ Failed to refresh token. Please check your refresh token or login again.");
        }
    } else if (refreshChoice === "2") {
        console.log(`🔄 Force-refreshing token for ${selectedAccount.displayName}...`);
        
        if (selectedAccount.refreshToken) {
            const newToken = await refreshJWTToken(selectedAccount.refreshToken);
            if (newToken) {
                // Update the account with new token
                selectedAccount.jwt = newToken;
                selectedAccount.lastRefreshed = new Date().toISOString();
                await saveJWTAccounts(accounts);
                
                // Update current JWT token if this is the active account
                if (selectedAccount.isActive) {
                    CURRENT_JWT_TOKEN = newToken;
                }
                
                console.log("✅ Token force-refreshed successfully!");
            } else {
                console.log("❌ Failed to force-refresh token. Please check your refresh token or login again.");
            }
        } else {
            console.log("❌ No refresh token available for this account.");
        }
    } else if (refreshChoice === "3") {
        return await displayAccountSelector();
    } else {
        console.log("❌ Invalid choice. Please try again.");
        await getUserInput("Press Enter to continue...");
        return await refreshTokenMenu();
    }
        
        await getUserInput("Press Enter to continue...");
        return await refreshTokenMenu();
    } else if (choiceNum === accounts.accounts.length + 1) {
        return await displayAccountSelector();
    } else {
        console.log("❌ Invalid choice. Please try again.");
        await getUserInput("Press Enter to continue...");
        return await refreshTokenMenu();
    }
}

async function addNewAccount() {
    console.clear();
    console.log("\n➕ ADD NEW ACCOUNT");
    console.log("=" .repeat(50));
    
    const username = await getUserInput("👤 Enter username (display name): ");
    if (!username.trim()) {
        console.log("❌ Username cannot be empty.");
        await getUserInput("Press Enter to continue...");
        return await displayAccountSelector();
    }
    
    console.log("\n🎫 Enter JWT Token:");
    console.log("💡 Get this from https://app.union.build > Developer Tools > Network > Authorization header");
    console.log("📝 Format: Bearer eyJhbGciOiJIUzI1NiIs...");
    
    const jwt = await getUserInput("🔐 JWT Token: ");
    if (!jwt.trim()) {
        console.log("❌ JWT token cannot be empty.");
        await getUserInput("Press Enter to continue...");
        return await displayAccountSelector();
    }
    
    // Validate JWT token
    const userInfo = extractUserInfoFromJWT(jwt);
    if (!userInfo) {
        console.log("❌ Invalid JWT token format.");
        await getUserInput("Press Enter to continue...");
        return await displayAccountSelector();
    }
    
    if (userInfo.exp <= Date.now() / 1000) {
        console.log("❌ JWT token has expired.");
        await getUserInput("Press Enter to continue...");
        return await displayAccountSelector();
    }
    
    // Ask for refresh token (optional)
    console.log("\n🔄 Enter Refresh Token (Optional):");
    console.log("💡 This allows automatic token refresh when it expires");
    console.log("📝 Get this from the same network request as the JWT token");
    console.log("⏭️  Press Enter to skip if you don't have it");
    
    const refreshToken = await getUserInput("🔑 Refresh Token (optional): ");
    
    // Load existing accounts
    const accounts = await loadJWTAccounts();
    
    // Check if account already exists
    const existingAccount = accounts.accounts.find(acc => 
        extractUserInfoFromJWT(acc.jwt)?.userId === userInfo.userId
    );
    
    if (existingAccount) {
        console.log("⚠️  Account already exists. Updating JWT token...");
        existingAccount.jwt = jwt;
        existingAccount.username = username;
        existingAccount.displayName = username;
        if (refreshToken.trim()) {
            existingAccount.refreshToken = refreshToken.trim();
        }
        existingAccount.lastUpdated = new Date().toISOString();
    } else {
        // Add new account
        const newAccount = {
            username: username,
            displayName: username,
            jwt: jwt,
            isActive: false,
            addedAt: new Date().toISOString()
        };
        
        if (refreshToken.trim()) {
            newAccount.refreshToken = refreshToken.trim();
        }
        
        accounts.accounts.push(newAccount);
    }
    
    await saveJWTAccounts(accounts);
    
    console.log(`✅ Account "${username}" added successfully!`);
    console.log(`📧 Email: ${userInfo.email}`);
    console.log(`🆔 User ID: ${userInfo.userId}`);
    
    await getUserInput("Press Enter to continue...");
    return await displayAccountSelector();
}

async function editAccount() {
    console.clear();
    console.log("\n✏️  EDIT ACCOUNT");
    console.log("=" .repeat(50));
    
    const accounts = await loadJWTAccounts();
    
    if (accounts.accounts.length === 0) {
        console.log("❌ No accounts to edit.");
        await getUserInput("Press Enter to continue...");
        return await displayAccountSelector();
    }
    
    console.log("Select account to edit:");
    accounts.accounts.forEach((account, index) => {
        console.log(`${index + 1}️⃣  ${account.displayName}`);
    });
    
    const choice = await getUserInput("\n👉 Select account to edit: ");
    const choiceNum = parseInt(choice);
    
    if (choiceNum < 1 || choiceNum > accounts.accounts.length) {
        console.log("❌ Invalid choice.");
        await getUserInput("Press Enter to continue...");
        return await displayAccountSelector();
    }
    
    const accountToEdit = accounts.accounts[choiceNum - 1];
    
    console.log("\n🔧 Edit Options:");
    console.log("1️⃣  Update Username");
    console.log("2️⃣  Update JWT Token");
    console.log("3️⃣  Update Both");
    console.log("4️⃣  Cancel");
    
    const editChoice = await getUserInput("\n👉 Select option: ");
    
    switch (editChoice) {
        case "1":
            const newUsername = await getUserInput("👤 Enter new username: ");
            if (newUsername.trim()) {
                accountToEdit.username = newUsername;
                accountToEdit.displayName = newUsername;
            }
            break;
        case "2":
            const newJWT = await getUserInput("🔐 Enter new JWT token: ");
            if (newJWT.trim()) {
                const userInfo = extractUserInfoFromJWT(newJWT);
                if (userInfo && userInfo.exp > Date.now() / 1000) {
                    accountToEdit.jwt = newJWT;
                } else {
                    console.log("❌ Invalid or expired JWT token.");
                    await getUserInput("Press Enter to continue...");
                    return await displayAccountSelector();
                }
            }
            break;
        case "3":
            const newUsername2 = await getUserInput("👤 Enter new username: ");
            const newJWT2 = await getUserInput("🔐 Enter new JWT token: ");
            if (newUsername2.trim() && newJWT2.trim()) {
                const userInfo = extractUserInfoFromJWT(newJWT2);
                if (userInfo && userInfo.exp > Date.now() / 1000) {
                    accountToEdit.username = newUsername2;
                    accountToEdit.displayName = newUsername2;
                    accountToEdit.jwt = newJWT2;
                } else {
                    console.log("❌ Invalid or expired JWT token.");
                    await getUserInput("Press Enter to continue...");
                    return await displayAccountSelector();
                }
            }
            break;
        case "4":
            return await displayAccountSelector();
        default:
            console.log("❌ Invalid option.");
            await getUserInput("Press Enter to continue...");
            return await displayAccountSelector();
    }
    
    await saveJWTAccounts(accounts);
    console.log("✅ Account updated successfully!");
    await getUserInput("Press Enter to continue...");
    return await displayAccountSelector();
}

async function deleteAccount() {
    console.clear();
    console.log("\n🗑️  DELETE ACCOUNT");
    console.log("=" .repeat(50));
    
    const accounts = await loadJWTAccounts();
    
    if (accounts.accounts.length === 0) {
        console.log("❌ No accounts to delete.");
        await getUserInput("Press Enter to continue...");
        return await displayAccountSelector();
    }
    
    console.log("Select account to delete:");
    accounts.accounts.forEach((account, index) => {
        console.log(`${index + 1}️⃣  ${account.displayName}`);
    });
    
    const choice = await getUserInput("\n👉 Select account to delete: ");
    const choiceNum = parseInt(choice);
    
    if (choiceNum < 1 || choiceNum > accounts.accounts.length) {
        console.log("❌ Invalid choice.");
        await getUserInput("Press Enter to continue...");
        return await displayAccountSelector();
    }
    
    const accountToDelete = accounts.accounts[choiceNum - 1];
    
    console.log(`⚠️  Are you sure you want to delete "${accountToDelete.displayName}"?`);
    const confirm = await getUserInput("Type 'yes' to confirm: ");
    
    if (confirm.toLowerCase() === 'yes') {
        accounts.accounts.splice(choiceNum - 1, 1);
        
        // If deleted account was active, set first account as active
        if (accountToDelete.isActive && accounts.accounts.length > 0) {
            accounts.accounts[0].isActive = true;
            CURRENT_JWT_TOKEN = accounts.accounts[0].jwt;
        }
        
        await saveJWTAccounts(accounts);
        console.log("✅ Account deleted successfully!");
    } else {
        console.log("❌ Delete cancelled.");
    }
    
    await getUserInput("Press Enter to continue...");
    return await displayAccountSelector();
}

// ============= Configuration =============
const UNION_API_CONFIG = {
    baseURL: 'https://api.dashboard.union.build/rest/v1',
    headers: {
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6,te;q=0.5',
        'accept-profile': 'public',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcnF6cHVyeXJnZm5lY2FkYWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzM0NDAsImV4cCI6MjA0OTk0OTQ0MH0.4xkWpfMkYgBz4nqUGkZVjQNP7NxLa4filDoJRCI3yWo',
        'origin': 'https://app.union.build',
        'referer': 'https://app.union.build/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    }
};

// Dynamic headers function that uses current JWT token
function getAPIHeaders() {
    return {
        ...UNION_API_CONFIG.headers,
        'authorization': CURRENT_JWT_TOKEN
    };
}

// ============= Rank System Definition =============
const RANK_SYSTEM = {
    1: { name: "Conscript", xpRequired: 0 },
    2: { name: "Private First Class", xpRequired: 50 },
    3: { name: "Junior Sergeant", xpRequired: 100 },
    4: { name: "Sergeant", xpRequired: 200 },
    5: { name: "Senior Sergeant", xpRequired: 350 },
    6: { name: "Starshina", xpRequired: 500 },
    7: { name: "Junior Lieutenant", xpRequired: 700 },
    8: { name: "Lieutenant", xpRequired: 950 },
    9: { name: "Senior Lieutenant", xpRequired: 1250 },
    10: { name: "Junior Captain", xpRequired: 1600 },
    11: { name: "Captain", xpRequired: 2000 },
    12: { name: "Senior Captain", xpRequired: 2500 }
};

// ============= Utility Functions =============
function displayBanner() {
    console.clear();
    console.log("\n🎖️  ==================================== 🎖️");
    console.log("       Union Account & Achievement Checker");
    console.log("🎖️  ==================================== 🎖️\n");
}

async function getUserInput(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

// ============= Data Fetching Functions =============
async function fetchUserAccountData() {
    try {
        // Check if JWT token is available
        if (!CURRENT_JWT_TOKEN) {
            throw new Error("JWT token not available. Please select an account first.");
        }
        
        // Extract user ID from JWT token (sub field)
        const token = CURRENT_JWT_TOKEN.split(' ')[1];
        if (!token) {
            throw new Error("Invalid JWT token format. Token must start with 'Bearer '.");
        }
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        console.log(`📡 Fetching data for user ID: ${userId}`);

        const response = await axios.get(`${UNION_API_CONFIG.baseURL}/leaderboard`, {
            params: {
                select: '*',
                user_id: `eq.${userId}`
            },
            headers: {
                ...getAPIHeaders(),
                'accept': 'application/vnd.pgrst.object+json'
            },
            timeout: 10000
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error fetching user account data:", error.message);
        throw error;
    }
}

async function fetchUserAchievements() {
    try {
        // Check if JWT token is available
        if (!CURRENT_JWT_TOKEN) {
            throw new Error("JWT token not available. Please select an account first.");
        }
        
        // Extract user ID from JWT token
        const token = CURRENT_JWT_TOKEN.split(' ')[1];
        if (!token) {
            throw new Error("Invalid JWT token format. Token must start with 'Bearer '.");
        }
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        const response = await axios.get(`${UNION_API_CONFIG.baseURL}/user_achievements`, {
            params: {
                select: '*,achievement:achievements(*,category:categories!achievements_category_fkey(id,title),subcategory:categories!achievements_subcategory_fkey(id,title))',
                user_id: `eq.${userId}`
            },
            headers: getAPIHeaders(),
            timeout: 10000
        });

        return response.data;
    } catch (error) {
        console.log("⚠️  User achievements endpoint not available");
        return [];
    }
}

async function fetchAllAchievements() {
    try {
        const response = await axios.get(`${UNION_API_CONFIG.baseURL}/achievements`, {
            params: {
                select: '*,reward_achievements(rewards(*)),category:categories!achievements_category_fkey(id,title),subcategory:categories!achievements_subcategory_fkey(id,title)'
            },
            headers: getAPIHeaders(),
            timeout: 10000
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error fetching achievements:", error.message);
        throw error;
    }
}

// ============= Analysis Functions =============
function calculateCurrentRank(totalXP) {
    let currentRank = 1;
    
    for (let level = 1; level <= 12; level++) {
        if (totalXP >= RANK_SYSTEM[level].xpRequired) {
            currentRank = level;
        } else {
            break;
        }
    }
    
    return currentRank;
}

function calculateNextRankProgress(totalXP, currentRank) {
    const nextRank = currentRank + 1;
    
    if (!RANK_SYSTEM[nextRank]) {
        return {
            nextRank: null,
            nextRankName: "Max Rank Reached",
            xpNeeded: 0,
            xpProgress: 0,
            progressPercentage: 100
        };
    }
    
    const currentRankXP = RANK_SYSTEM[currentRank].xpRequired;
    const nextRankXP = RANK_SYSTEM[nextRank].xpRequired;
    const xpForNextRank = nextRankXP - currentRankXP;
    const currentProgress = totalXP - currentRankXP;
    
    return {
        nextRank: nextRank,
        nextRankName: RANK_SYSTEM[nextRank].name,
        xpNeeded: nextRankXP - totalXP,
        xpProgress: currentProgress,
        xpForNextRank: xpForNextRank,
        progressPercentage: Math.min(100, (currentProgress / xpForNextRank) * 100)
    };
}

function categorizeAchievements(achievements) {
    const categories = {
        social: { name: "Social", achievements: [], totalXP: 0 },
        onchain: { name: "On-Chain", achievements: [], totalXP: 0 },
        ranks: { name: "Ranks", achievements: [], totalXP: 0 },
        other: { name: "Other", achievements: [], totalXP: 0 }
    };
    
    achievements.forEach(achievement => {
        const category = achievement.category?.title?.toLowerCase() || 'other';
        const isRank = achievement.type === 14; // Type 14 = rank achievements
        
        let targetCategory = 'other';
        if (isRank) {
            targetCategory = 'ranks';
        } else if (category === 'social') {
            targetCategory = 'social';
        } else if (category === 'onchain') {
            targetCategory = 'onchain';
        }
        
        categories[targetCategory].achievements.push(achievement);
        categories[targetCategory].totalXP += achievement.xp || 0;
    });
    
    return categories;
}

// ============= Display Functions =============
function displayAccountSummary(userData) {
    console.log("📊 ACCOUNT SUMMARY");
    console.log("=" .repeat(50));
    console.log(`👤 Display Name: ${userData.display_name}`);
    console.log(`🎯 Current Rank: ${userData.title} (Level ${userData.level})`);
    console.log(`⭐ Current XP: ${userData.current_xp} XP`);
    console.log(`🏆 Total XP Earned: ${userData.total_xp} XP`);
    console.log(`📊 Global Rank: #${userData.rank.toLocaleString()}`);
    
    // Calculate next level progress
    const nextLevelXPRequired = userData.xp_required;
    const currentLevelProgress = userData.current_xp;
    const progressPercentage = (currentLevelProgress / nextLevelXPRequired) * 100;
    
    console.log(`\n🎖️  NEXT LEVEL PROGRESS`);
    console.log(`📈 Next Level: ${userData.level + 1}`);
    console.log(`🔥 XP Needed: ${nextLevelXPRequired - currentLevelProgress} XP`);
    console.log(`📊 Progress: ${currentLevelProgress}/${nextLevelXPRequired} XP`);
    
    // Progress bar
    const progressBar = createProgressBar(progressPercentage);
    console.log(`${progressBar} ${progressPercentage.toFixed(1)}%`);
    
    console.log("\n" + "=" .repeat(50));
}

function displayUserProfile(userData) {
    console.log("👤 USER PROFILE");
    console.log("=" .repeat(50));
    console.log(`📛 Display Name: ${userData.display_name}`);
    console.log(`🎖️  Current Title: ${userData.title}`);
    console.log(`📊 Level: ${userData.level}`);
    console.log(`🏆 Global Rank: #${userData.rank.toLocaleString()}`);
    console.log(`📸 Profile Picture: ${userData.pfp ? 'Set' : 'Not Set'}`);
    console.log(`🆔 User ID: ${userData.user_id}`);
    console.log("\n" + "=" .repeat(50));
}

function displayXPBreakdown(userData) {
    console.log("⭐ XP BREAKDOWN");
    console.log("=" .repeat(50));
    console.log(`💎 Current XP: ${userData.current_xp} XP`);
    console.log(`🏆 Total XP Ever Earned: ${userData.total_xp} XP`);
    console.log(`📈 XP Used for Leveling: ${userData.total_xp - userData.current_xp} XP`);
    console.log(`🎯 XP Needed for Next Level: ${userData.xp_required} XP`);
    console.log(`🔥 XP Remaining: ${userData.xp_required - userData.current_xp} XP`);
    
    // Calculate efficiency
    const efficiency = userData.total_xp > 0 ? (userData.current_xp / userData.total_xp) * 100 : 0;
    console.log(`📊 XP Efficiency: ${efficiency.toFixed(1)}%`);
    
    console.log("\n" + "=" .repeat(50));
}

function displayRankComparison(userData) {
    console.log("🏆 RANK ANALYSIS");
    console.log("=" .repeat(50));
    console.log(`📊 Your Global Rank: #${userData.rank.toLocaleString()}`);
    console.log(`  Current Level: ${userData.level} (${userData.title})`);
    
    // Estimate total users (rough calculation)
    const estimatedTotalUsers = userData.rank * 1.2; // Rough estimate
    const percentile = ((estimatedTotalUsers - userData.rank) / estimatedTotalUsers) * 100;
    
    console.log(`📈 Estimated Percentile: Top ${(100 - percentile).toFixed(1)}%`);
    console.log(`👥 Estimated Total Users: ~${Math.round(estimatedTotalUsers).toLocaleString()}`);
    
    // Level distribution estimate
    console.log(`\n📊 Level ${userData.level} Statistics:`);
    console.log(`   🎖️  Title: ${userData.title}`);
    console.log(`   ⭐ Current XP: ${userData.current_xp}`);
    console.log(`   🎯 XP for Next Level: ${userData.xp_required}`);
    
    console.log("\n" + "=" .repeat(50));
}

function createProgressBar(percentage) {
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;
    
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

function displayCategoryBreakdown(userAchievements) {
    console.log("\n📈 YOUR ACHIEVEMENT BREAKDOWN");
    console.log("=" .repeat(50));
    
    if (userAchievements.length === 0) {
        console.log("❌ No personal achievements found.");
        return;
    }
    
    const categories = {
        social: { name: "Social", achievements: [], totalXP: 0 },
        onchain: { name: "On-Chain", achievements: [], totalXP: 0 },
        ranks: { name: "Ranks", achievements: [], totalXP: 0 },
        other: { name: "Other", achievements: [], totalXP: 0 }
    };
    
    userAchievements.forEach(userAchievement => {
        const achievement = userAchievement.achievement;
        const category = achievement.category?.title?.toLowerCase() || 'other';
        const isRank = achievement.type === 14; // Type 14 = rank achievements
        
        let targetCategory = 'other';
        if (isRank) {
            targetCategory = 'ranks';
        } else if (category === 'social') {
            targetCategory = 'social';
        } else if (category === 'onchain') {
            targetCategory = 'onchain';
        }
        
        categories[targetCategory].achievements.push(achievement);
        categories[targetCategory].totalXP += achievement.xp || 0;
    });
    
    Object.entries(categories).forEach(([key, category]) => {
        if (category.achievements.length > 0) {
            console.log(`\n${getCategoryIcon(key)} ${category.name}:`);
            console.log(`   🏆 Achievements: ${category.achievements.length}`);
            console.log(`   ⭐ Total XP: ${category.totalXP}`);
            console.log(`   📊 Avg XP per Achievement: ${(category.totalXP / category.achievements.length).toFixed(1)}`);
        }
    });
    
    console.log(`\n📊 Total Personal Achievements: ${userAchievements.length}`);
    console.log(`⭐ Total XP from Achievements: ${userAchievements.reduce((sum, ua) => sum + (ua.achievement.xp || 0), 0)}`);
}

function getCategoryIcon(category) {
    const icons = {
        social: "👥",
        onchain: "⛓️",
        ranks: "🎖️",
        other: "📂"
    };
    return icons[category] || "📂";
}

function displayTopAchievements(achievements) {
    console.log("\n🏆 TOP XP ACHIEVEMENTS");
    console.log("=" .repeat(50));
    
    // Sort by XP value, descending
    const topAchievements = achievements
        .filter(a => a.xp > 0)
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);
    
    topAchievements.forEach((achievement, index) => {
        const rankIcon = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}️⃣`;
        console.log(`${rankIcon} ${achievement.title} - ${achievement.xp} XP`);
        console.log(`   📝 ${achievement.description}`);
        console.log(`   📂 ${achievement.category?.title || 'N/A'} > ${achievement.subcategory?.title || 'N/A'}\n`);
    });
}

function displayRecentAchievements(achievements) {
    console.log("\n🆕 RECENT ACHIEVEMENTS");
    console.log("=" .repeat(50));
    
    // Sort by creation date, most recent first
    const recentAchievements = achievements
        .filter(a => a.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    recentAchievements.forEach((achievement, index) => {
        const date = new Date(achievement.created_at).toLocaleDateString();
        console.log(`${index + 1}️⃣ ${achievement.title} - ${achievement.xp} XP`);
        console.log(`   📅 Added: ${date}`);
        console.log(`   📝 ${achievement.description}\n`);
    });
}

// ============= Main Menu Functions =============
function displayMenu() {
    console.log("\n🔹 Select an Option:");
    console.log("1️⃣  View Account Summary");
    console.log("2️⃣  View User Profile");
    console.log("3️⃣  View XP Breakdown");
    console.log("4️⃣  View Rank Analysis");
    console.log("5️⃣  View Your Achievements");
    console.log("6️⃣  View All Available Achievements");
    console.log("7️⃣  View Transfer Tasks & Progress");
    console.log("8️⃣  Refresh Data");
    console.log("9️⃣  Switch Account / Account Manager");
    console.log("🔟  Back to Main Menu");
    console.log();
}

async function displayTransferTasks(allAchievements, userAchievements) {
    console.log("\n🔄 TRANSFER TASKS & PROGRESS");
    console.log("=" .repeat(50));
    
    // Show chain selection menu
    console.log("\n🔗 Select chains to view XP tasks for:");
    console.log("1️⃣  Babylon");
    console.log("2️⃣  Sei");
    console.log("3️⃣  Xion");
    console.log("4️⃣  Osmosis");
    console.log("5️⃣  Corn");
    console.log("6️⃣  Ethereum (Sepolia/Holesky)");
    console.log("7️⃣  Arbitrum");
    console.log("8️⃣  Berachain");
    console.log("9️⃣  All Chains");
    console.log("0️⃣  Custom Selection");
    
    const chainChoice = await getUserInput("\n👉 Enter your choice (0-9): ");
    
    let selectedChains = [];
    
    if (chainChoice === "9") {
        selectedChains = ['babylon', 'sei', 'xion', 'osmosis', 'corn', 'ethereum', 'arbitrum', 'berachain'];
    } else if (chainChoice === "0") {
        console.log("\n🎯 Custom Chain Selection:");
        console.log("Enter chain numbers separated by commas (e.g., 1,2,3):");
        console.log("1=Babylon, 2=Sei, 3=Xion, 4=Osmosis, 5=Corn, 6=Ethereum, 7=Arbitrum, 8=Berachain");
        const customInput = await getUserInput("👉 Chains: ");
        const chainNumbers = customInput.split(',').map(n => n.trim());
        
        const chainMapping = {
            '1': 'babylon',
            '2': 'sei', 
            '3': 'xion',
            '4': 'osmosis',
            '5': 'corn',
            '6': 'ethereum',
            '7': 'arbitrum',
            '8': 'berachain'
        };
        
        selectedChains = chainNumbers.map(num => chainMapping[num]).filter(Boolean);
    } else {
        const chainMapping = {
            '1': ['babylon'],
            '2': ['sei'],
            '3': ['xion'],
            '4': ['osmosis'],
            '5': ['corn'],
            '6': ['ethereum'],
            '7': ['arbitrum'],
            '8': ['berachain']
        };
        selectedChains = chainMapping[chainChoice] || [];
    }
    
    if (selectedChains.length === 0) {
        console.log("❌ No chains selected. Returning to menu...");
        return;
    }
    
    // Get user completed achievement IDs
    const userCompletedIds = new Set(userAchievements.map(ua => ua.achievement.id));
    
    // Filter transfer-related achievements for selected chains
    const transferAchievements = allAchievements.filter(achievement => {
        const title = achievement.title.toLowerCase();
        const description = achievement.description.toLowerCase();
        
        // Check if achievement is transfer-related
        const isTransferRelated = title.includes('transfer') || 
                                description.includes('transfer') ||
                                title.includes('bridge') ||
                                description.includes('bridge') ||
                                title.includes('cross-chain') ||
                                description.includes('cross-chain') ||
                                title.includes('interacted') ||
                                description.includes('interacted');
        
        if (!isTransferRelated) {
            return false;
        }
        
        // Check if achievement belongs to selected chains
        return selectedChains.some(chain => {
            switch(chain) {
                case 'babylon':
                    return title.includes('babylon') || description.includes('babylon');
                case 'sei':
                    return title.includes('sei') || description.includes('sei') ||
                           title.includes('pacific') || description.includes('pacific') ||
                           title.includes('seitestnet') || description.includes('seitestnet');
                case 'xion':
                    return title.includes('xion') || description.includes('xion');
                case 'osmosis':
                    return title.includes('osmosis') || description.includes('osmosis') ||
                           title.includes('osmo') || description.includes('osmo');
                case 'corn':
                    return title.includes('corn') || description.includes('corn') ||
                           title.includes('btcn') || description.includes('btcn');
                case 'ethereum':
                    return title.includes('sepolia') || title.includes('holesky') || 
                           description.includes('sepolia') || description.includes('holesky') ||
                           title.includes('ethereum') || description.includes('ethereum');
                case 'arbitrum':
                    return title.includes('arbitrum') || description.includes('arbitrum');
                case 'berachain':
                    return title.includes('berachain') || description.includes('berachain') ||
                           title.includes('bera') || description.includes('bera') ||
                           title.includes('artio') || description.includes('artio');
                default:
                    return false;
            }
        });
    });
    
    if (transferAchievements.length === 0) {
        console.log("❌ No transfer-related achievements found for selected chains.");
        console.log("🔍 Debug: Let me check what achievements exist...");
        
        // Debug: Show all achievements with transfer-related keywords
        const debugAchievements = allAchievements.filter(achievement => {
            const title = achievement.title.toLowerCase();
            const description = achievement.description.toLowerCase();
            
            return title.includes('transfer') || description.includes('transfer') ||
                   title.includes('bridge') || description.includes('bridge') ||
                   title.includes('cross-chain') || description.includes('cross-chain') ||
                   title.includes('interacted') || description.includes('interacted');
        });
        
        console.log(`📊 Found ${debugAchievements.length} total transfer-related achievements`);
        
        // Show selected chains
        console.log(`🎯 Selected chains: ${selectedChains.join(', ')}`);
        
        // Show a few examples
        if (debugAchievements.length > 0) {
            console.log("🔍 Sample achievements found:");
            debugAchievements.slice(0, 5).forEach((achievement, index) => {
                console.log(`${index + 1}. ${achievement.title}`);
                console.log(`   📝 ${achievement.description}`);
            });
        }
        
        return;
    }
    
    // Group by chain/category
    const chainGroups = {
        babylon: { name: "Babylon", tasks: [] },
        sei: { name: "Sei", tasks: [] },
        xion: { name: "Xion", tasks: [] },
        osmosis: { name: "Osmosis", tasks: [] },
        corn: { name: "Corn", tasks: [] },
        ethereum: { name: "Ethereum (Sepolia/Holesky)", tasks: [] },
        arbitrum: { name: "Arbitrum", tasks: [] },
        berachain: { name: "Berachain", tasks: [] },
        other: { name: "Other Chains", tasks: [] }
    };
    
    transferAchievements.forEach(achievement => {
        const title = achievement.title.toLowerCase();
        const description = achievement.description.toLowerCase();
        const isCompleted = userCompletedIds.has(achievement.id);
        
        let targetGroup = 'other';
        if (title.includes('babylon') || description.includes('babylon')) {
            targetGroup = 'babylon';
        } else if (title.includes('sei') || description.includes('sei') || title.includes('pacific') || description.includes('pacific') || title.includes('seitestnet') || description.includes('seitestnet')) {
            targetGroup = 'sei';
        } else if (title.includes('xion') || description.includes('xion')) {
            targetGroup = 'xion';
        } else if (title.includes('osmosis') || description.includes('osmosis') || title.includes('osmo') || description.includes('osmo')) {
            targetGroup = 'osmosis';
        } else if (title.includes('corn') || description.includes('corn') || title.includes('btcn') || description.includes('btcn')) {
            targetGroup = 'corn';
        } else if (title.includes('sepolia') || title.includes('holesky') || description.includes('sepolia') || description.includes('holesky') || title.includes('ethereum') || description.includes('ethereum')) {
            targetGroup = 'ethereum';
        } else if (title.includes('arbitrum') || description.includes('arbitrum')) {
            targetGroup = 'arbitrum';
        } else if (title.includes('berachain') || description.includes('berachain') || title.includes('bera') || description.includes('bera') || title.includes('artio') || description.includes('artio')) {
            targetGroup = 'berachain';
        }
        
        chainGroups[targetGroup].tasks.push({
            ...achievement,
            isCompleted
        });
    });
    
    // Display each chain group
    Object.entries(chainGroups).forEach(([key, group]) => {
        if (group.tasks.length > 0) {
            console.log(`\n${getChainIcon(key)} ${group.name}:`);
            console.log("-".repeat(40));
            
            group.tasks.forEach(task => {
                const status = task.isCompleted ? "✅ COMPLETED" : "🔄 AVAILABLE";
                const xpText = task.xp > 0 ? `${task.xp} XP` : "No XP";
                
                console.log(`${status} ${task.title} - ${xpText}`);
                console.log(`   📝 ${task.description}`);
                
                // Try to extract transfer count from description
                const transferCount = extractTransferCount(task.description);
                if (transferCount && !task.isCompleted) {
                    console.log(`   🎯 Target: ${transferCount} transfers`);
                    console.log(`   📊 Progress: 0/${transferCount} (0%)`);
                    console.log(`   🔥 Remaining: ${transferCount} transfers needed`);
                }
                
                console.log(`   📂 ${task.category?.title || 'N/A'} > ${task.subcategory?.title || 'N/A'}`);
                console.log();
            });
        }
    });
    
    // Summary
    const totalTasks = transferAchievements.length;
    const completedTasks = transferAchievements.filter(a => userCompletedIds.has(a.id)).length;
    const availableTasks = totalTasks - completedTasks;
    const totalXP = transferAchievements.reduce((sum, a) => sum + (a.xp || 0), 0);
    const earnedXP = transferAchievements.filter(a => userCompletedIds.has(a.id)).reduce((sum, a) => sum + (a.xp || 0), 0);
    
    console.log("📊 TRANSFER TASKS SUMMARY");
    console.log("-".repeat(40));
    console.log(`🏆 Total Tasks: ${totalTasks}`);
    console.log(`✅ Completed: ${completedTasks}`);
    console.log(`  Available: ${availableTasks}`);
    console.log(`⭐ Total XP Available: ${totalXP}`);
    console.log(`💎 XP Earned: ${earnedXP}`);
    console.log(`🎯 XP Remaining: ${totalXP - earnedXP}`);
    console.log(`📈 Completion Rate: ${((completedTasks / totalTasks) * 100).toFixed(1)}%`);
}

function getChainIcon(chain) {
    const icons = {
        babylon: "🏛️",
        sei: "🌾",
        xion: "🔮",
        osmosis: "🌊",
        corn: "🌽",
        ethereum: "💎",
        arbitrum: "🔷",
        berachain: "🐻",
        other: "⛓️"
    };
    return icons[chain] || "⛓️";
}

function extractTransferCount(description) {
    // Try to extract numbers like "500 transfers", "100 transactions", etc.
    const patterns = [
        /(\d+)\s+transfers?/i,
        /(\d+)\s+transactions?/i,
        /(\d+)\s+times?/i,
        /complete\s+(\d+)/i
    ];
    
    for (const pattern of patterns) {
        const match = description.match(pattern);
        if (match) {
            return parseInt(match[1]);
        }
    }
    
    return null;
}

async function displayTaskRecommendations(allAchievements, userAchievements) {
    console.log("\n💡 RECOMMENDED TRANSFER TASKS");
    console.log("=" .repeat(50));
    
    // Show chain selection menu
    console.log("\n🔗 Select chains for task recommendations:");
    console.log("1️⃣  Babylon");
    console.log("2️⃣  Sei");
    console.log("3️⃣  Xion");
    console.log("4️⃣  Osmosis");
    console.log("5️⃣  Corn");
    console.log("6️⃣  Ethereum (Sepolia/Holesky)");
    console.log("7️⃣  Arbitrum");
    console.log("8️⃣  Berachain");
    console.log("9️⃣  All Chains");
    console.log("0️⃣  Custom Selection");
    
    const chainChoice = await getUserInput("\n👉 Enter your choice (0-9): ");
    
    let selectedChains = [];
    
    if (chainChoice === "9") {
        selectedChains = ['babylon', 'sei', 'xion', 'osmosis', 'corn', 'ethereum', 'arbitrum', 'berachain'];
    } else if (chainChoice === "0") {
        console.log("\n🎯 Custom Chain Selection:");
        console.log("Enter chain numbers separated by commas (e.g., 1,2,3):");
        console.log("1=Babylon, 2=Sei, 3=Xion, 4=Osmosis, 5=Corn, 6=Ethereum, 7=Arbitrum, 8=Berachain");
        const customInput = await getUserInput("👉 Chains: ");
        const chainNumbers = customInput.split(',').map(n => n.trim());
        
        const chainMapping = {
            '1': 'babylon',
            '2': 'sei', 
            '3': 'xion',
            '4': 'osmosis',
            '5': 'corn',
            '6': 'ethereum',
            '7': 'arbitrum',
            '8': 'berachain'
        };
        
        selectedChains = chainNumbers.map(num => chainMapping[num]).filter(Boolean);
    } else {
        const chainMapping = {
            '1': ['babylon'],
            '2': ['sei'],
            '3': ['xion'],
            '4': ['osmosis'],
            '5': ['corn'],
            '6': ['ethereum'],
            '7': ['arbitrum'],
            '8': ['berachain']
        };
        selectedChains = chainMapping[chainChoice] || [];
    }
    
    if (selectedChains.length === 0) {
        console.log("❌ No chains selected. Returning to menu...");
        return;
    }
    
    const userCompletedIds = new Set(userAchievements.map(ua => ua.achievement.id));
    
    // Filter incomplete transfer tasks for selected chains
    const availableTasks = allAchievements.filter(achievement => {
        const title = achievement.title.toLowerCase();
        const description = achievement.description.toLowerCase();
        
        // Check if achievement is transfer-related
        const isTransferRelated = title.includes('transfer') || 
                                description.includes('transfer') ||
                                title.includes('bridge') ||
                                description.includes('bridge') ||
                                title.includes('interacted') ||
                                description.includes('interacted');
        
        if (!isTransferRelated || userCompletedIds.has(achievement.id) || achievement.xp <= 0) {
            return false;
        }
        
        // Check if achievement belongs to selected chains
        return selectedChains.some(chain => {
            switch(chain) {
                case 'babylon':
                    return title.includes('babylon') || description.includes('babylon');
                case 'sei':
                    return title.includes('sei') || description.includes('sei') ||
                           title.includes('pacific') || description.includes('pacific') ||
                           title.includes('seitestnet') || description.includes('seitestnet');
                case 'xion':
                    return title.includes('xion') || description.includes('xion');
                case 'osmosis':
                    return title.includes('osmosis') || description.includes('osmosis') ||
                           title.includes('osmo') || description.includes('osmo');
                case 'corn':
                    return title.includes('corn') || description.includes('corn') ||
                           title.includes('btcn') || description.includes('btcn');
                case 'ethereum':
                    return title.includes('sepolia') || title.includes('holesky') || 
                           description.includes('sepolia') || description.includes('holesky') ||
                           title.includes('ethereum') || description.includes('ethereum');
                case 'arbitrum':
                    return title.includes('arbitrum') || description.includes('arbitrum');
                case 'berachain':
                    return title.includes('berachain') || description.includes('berachain') ||
                           title.includes('bera') || description.includes('bera') ||
                           title.includes('artio') || description.includes('artio');
                default:
                    return false;
            }
        });
    });
    
    // Sort by XP value (highest first)
    availableTasks.sort((a, b) => b.xp - a.xp);
    
    if (availableTasks.length === 0) {
        console.log("🎉 Great! You've completed all transfer-related tasks for selected chains!");
        return;
    }
    
    console.log(`🎯 Found ${availableTasks.length} available transfer tasks:\n`);
    
    availableTasks.slice(0, 10).forEach((task, index) => {
        const priority = index < 3 ? "🔥 HIGH" : index < 6 ? "🟡 MEDIUM" : "🟢 LOW";
        console.log(`${index + 1}️⃣ ${priority} PRIORITY`);
        console.log(`   📋 ${task.title}`);
        console.log(`   ⭐ Reward: ${task.xp} XP`);
        console.log(`   📝 ${task.description}`);
        
        // Extract transfer count
        const transferCount = extractTransferCount(task.description);
        if (transferCount) {
            console.log(`   🎯 Required: ${transferCount} transfers`);
            console.log(`   ⏱️  Estimated time: ${Math.ceil(transferCount / 10)} sessions`);
        }
        
        console.log(`   📂 ${task.category?.title || 'N/A'} > ${task.subcategory?.title || 'N/A'}\n`);
    });
    
    const totalXPAvailable = availableTasks.reduce((sum, task) => sum + task.xp, 0);
    console.log(`💎 Total XP Available: ${totalXPAvailable}`);
    console.log(`🚀 Start with the highest priority tasks for maximum XP gain!`);
}

function displayRankAchievements(achievements) {
    console.log("\n🎖️  RANK ACHIEVEMENTS");
    console.log("=" .repeat(50));
    
    const rankAchievements = achievements
        .filter(a => a.type === 14)
        .sort((a, b) => (a.meta?.level || 0) - (b.meta?.level || 0));
    
    rankAchievements.forEach(achievement => {
        const level = achievement.meta?.level || '?';
        const hasReward = achievement.reward_achievements?.length > 0;
        const rewardIcon = hasReward ? "🎁" : "  ";
        
        console.log(`${rewardIcon} Level ${level}: ${achievement.title}`);
        console.log(`   📝 ${achievement.description}`);
        
        if (hasReward) {
            achievement.reward_achievements.forEach(reward => {
                console.log(`   🎁 Reward: ${reward.rewards.title}`);
            });
        }
        console.log();
    });
}

// ============= Main Application =============
async function main() {
    try {
        // Load and set active account
        const accounts = await loadJWTAccounts();
        
        // Check if any accounts exist
        if (accounts.accounts.length === 0) {
            console.log("📄 No accounts found. Let's add your first account!");
            const selectedAccount = await displayAccountSelector();
            if (!selectedAccount) {
                console.log("👋 Goodbye!");
                rl.close();
                return;
            }
            CURRENT_JWT_TOKEN = selectedAccount.jwt.startsWith('Bearer ') ? selectedAccount.jwt : `Bearer ${selectedAccount.jwt}`;
        } else {
            const activeAccount = accounts.accounts.find(acc => acc.isActive);
            
            if (activeAccount) {
                // Ensure JWT token has Bearer prefix
                CURRENT_JWT_TOKEN = activeAccount.jwt.startsWith('Bearer ') ? activeAccount.jwt : `Bearer ${activeAccount.jwt}`;
                
                // Check if token needs refresh or is expired
                const userInfo = extractUserInfoFromJWT(CURRENT_JWT_TOKEN);
                if (!userInfo || userInfo.exp <= Date.now() / 1000) {
                    console.log("❌ Current active account token has expired.");
                    
                    // Try to refresh if refresh token is available
                    if (activeAccount.refreshToken) {
                        console.log("🔄 Attempting to refresh expired token...");
                        const refreshed = await checkAndRefreshToken();
                        if (refreshed) {
                            console.log("✅ Token refreshed successfully!");
                            // Reload accounts to get updated token
                            const updatedAccounts = await loadJWTAccounts();
                            const updatedActiveAccount = updatedAccounts.accounts.find(acc => acc.isActive);
                            CURRENT_JWT_TOKEN = updatedActiveAccount.jwt.startsWith('Bearer ') ? updatedActiveAccount.jwt : `Bearer ${updatedActiveAccount.jwt}`;
                        } else {
                            console.log("❌ Failed to refresh token. Please select or update an account.");
                            const selectedAccount = await displayAccountSelector();
                            if (!selectedAccount) {
                                console.log("👋 Goodbye!");
                                rl.close();
                                return;
                            }
                            CURRENT_JWT_TOKEN = selectedAccount.jwt.startsWith('Bearer ') ? selectedAccount.jwt : `Bearer ${selectedAccount.jwt}`;
                        }
                    } else {
                        console.log("❌ No refresh token available. Please select or update an account.");
                        const selectedAccount = await displayAccountSelector();
                        if (!selectedAccount) {
                            console.log("👋 Goodbye!");
                            rl.close();
                            return;
                        }
                        CURRENT_JWT_TOKEN = selectedAccount.jwt.startsWith('Bearer ') ? selectedAccount.jwt : `Bearer ${selectedAccount.jwt}`;
                    }
                } else {
                    // Check if token will expire soon and refresh if possible
                    const timeToExpiry = userInfo.exp - Date.now() / 1000;
                    if (timeToExpiry <= 300 && activeAccount.refreshToken) { // 5 minutes
                        console.log("⚠️  Token expires soon. Attempting proactive refresh...");
                        await checkAndRefreshToken();
                        // Reload accounts to get updated token
                        const updatedAccounts = await loadJWTAccounts();
                        const updatedActiveAccount = updatedAccounts.accounts.find(acc => acc.isActive);
                        if (updatedActiveAccount) {
                            CURRENT_JWT_TOKEN = updatedActiveAccount.jwt.startsWith('Bearer ') ? updatedActiveAccount.jwt : `Bearer ${updatedActiveAccount.jwt}`;
                        }
                    }
                }
            } else {
                console.log("👋 Welcome! Please select an account to continue.");
                const selectedAccount = await displayAccountSelector();
                if (!selectedAccount) {
                    console.log("👋 Goodbye!");
                    rl.close();
                    return;
                }
                // Update token after account selection
                CURRENT_JWT_TOKEN = selectedAccount.jwt.startsWith('Bearer ') ? selectedAccount.jwt : `Bearer ${selectedAccount.jwt}`;
            }
        }
        
        displayBanner();
        
        // Show current account info
        const currentUserInfo = extractUserInfoFromJWT(CURRENT_JWT_TOKEN);
        if (currentUserInfo) {
            console.log(`👤 Current Account: ${currentUserInfo.fullName} (${currentUserInfo.username})`);
            console.log(`📧 Email: ${currentUserInfo.email}`);
            console.log(`🆔 User ID: ${currentUserInfo.userId}`);
            console.log();
        }
        
        console.log("📡 Fetching your Union account data...");
        const userData = await fetchUserAccountData();
        
        console.log("🏆 Fetching your achievements...");
        const userAchievements = await fetchUserAchievements();
        
        console.log("📊 Fetching available achievements...");
        const allAchievements = await fetchAllAchievements();
        
        console.log("✅ Data loaded successfully!\n");
        
        // Main menu loop
        while (true) {
            displayMenu();
            const choice = await getUserInput("👉 Enter your choice (1-10): ");
            
            switch (choice) {
                case "1":
                    displayAccountSummary(userData);
                    break;
                    
                case "2":
                    displayUserProfile(userData);
                    break;
                    
                case "3":
                    displayXPBreakdown(userData);
                    break;
                    
                case "4":
                    displayRankComparison(userData);
                    break;
                    
                case "5":
                    displayCategoryBreakdown(userAchievements);
                    break;
                    
                case "6":
                    displayTopAchievements(allAchievements);
                    break;
                    
                case "7":
                    await displayTransferTasks(allAchievements, userAchievements);
                    await getUserInput("\n🔍 Press Enter to see task recommendations...");
                    await displayTaskRecommendations(allAchievements, userAchievements);
                    break;
                    
                case "8":
                    console.log("🔄 Refreshing data...");
                    // Refetch all data
                    const newUserData = await fetchUserAccountData();
                    const newUserAchievements = await fetchUserAchievements();
                    const newAllAchievements = await fetchAllAchievements();
                    
                    // Update data references
                    Object.assign(userData, newUserData);
                    userAchievements.length = 0;
                    userAchievements.push(...newUserAchievements);
                    allAchievements.length = 0;
                    allAchievements.push(...newAllAchievements);
                    
                    console.log("✅ Data refreshed!");
                    break;
                    
                case "9":
                    const selectedAccount = await displayAccountSelector();
                    if (selectedAccount) {
                        // Ensure JWT token has Bearer prefix
                        CURRENT_JWT_TOKEN = selectedAccount.jwt.startsWith('Bearer ') ? selectedAccount.jwt : `Bearer ${selectedAccount.jwt}`;
                        
                        // Reload data for new account
                        console.log("🔄 Loading data for new account...");
                        const newUserData = await fetchUserAccountData();
                        const newUserAchievements = await fetchUserAchievements();
                        const newAllAchievements = await fetchAllAchievements();
                        
                        // Update data references
                        Object.assign(userData, newUserData);
                        userAchievements.length = 0;
                        userAchievements.push(...newUserAchievements);
                        allAchievements.length = 0;
                        allAchievements.push(...newAllAchievements);
                        
                        displayBanner();
                        console.log("✅ Account switched and data loaded!");
                    }
                    break;
                    
                case "10":
                    console.log(" 👋 Returning to main menu...");
                    rl.close();
                    return;
                    
                default:
                    console.log("❌ Invalid choice. Please try again.");
            }
            
            if (choice !== "10") {
                await getUserInput("\n✨ Press Enter to continue...");
                displayBanner();
                
                // Show current account info again
                const currentUserInfo = extractUserInfoFromJWT(CURRENT_JWT_TOKEN);
                if (currentUserInfo) {
                    console.log(`👤 Current Account: ${currentUserInfo.fullName} (${currentUserInfo.username})`);
                    console.log();
                }
            }
        }
        
    } catch (error) {
        console.error("💥 Application error:", error.message);
        console.error("🔍 Error details:", error.response?.data || error.stack);
        rl.close();
        process.exit(1);
    }
}

// Start the application
if (require.main === module) {
    main();
}

module.exports = {
    main
};
