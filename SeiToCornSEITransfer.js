
// ============= External Dependencies =============
const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { toHex } = require('viem');
const crypto = require('crypto').webcrypto;
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ============= Menu Interface Functions =============
function displayBanner() {
    console.clear();
    console.log("\n🌉 ==================================== 🌉");
    console.log("       Sei Testnet SEI Cross-Chain Transfer Bot");
    console.log("🌉 ==================================== 🌉\n");
}

function displayMenu() {
    console.log("🔹 Options:");
    console.log("1️⃣  Start New Transfer");
    console.log("2️⃣  Start Multiple Transfers");
    console.log("3️⃣  Exit\n");
}

async function getUserInput(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

async function getTransferParams() {
    console.log("\n📝 Transfer Configuration:");
    const amount = await getUserInput("💰 Enter SEI amount (default: 0.0001): ");
    const delay = await getUserInput("⏰ Enter delay between transactions in seconds (default: 0): ");
    const count = await getUserInput("🔄 Enter number of transactions (default: 1): ");
    
    const params = {
        amount: amount || "0.0001", // Default to 0.0001 SEI
        delay: (delay ? parseInt(delay) : 0) * 1000, // Convert to milliseconds
        count: count ? parseInt(count) : 1
    };

    // Validate inputs
    if (isNaN(params.amount) || params.amount <= 0) {
        throw new Error("Invalid SEI amount. Must be a positive number.");
    }
    if (isNaN(params.delay) || params.delay < 0) {
        throw new Error("Invalid delay. Must be a non-negative number.");
    }
    if (isNaN(params.count) || params.count < 1) {
        throw new Error("Invalid transaction count. Must be at least 1.");
    }

    return params;
}

// ============= Enhanced Transaction Function =============
async function executeTransfers(params) {
    console.log("\n🚀 Starting transfer(s)...");
    console.log("📊 Configuration:");
    console.log(`   Amount per transfer: ${params.amount} SEI`);
    console.log(`   Number of transfers: ${params.count}`);
    console.log(`   Delay between transfers: ${params.delay / 1000}s\n`);

    for (let i = 0; i < params.count; i++) {
        if (i > 0) {
            console.log(`\n⏳ Waiting for ${params.delay / 1000} seconds before next transfer...`);
            await sleep(params.delay);
        }
        console.log(`\n🔄 Executing transfer ${i + 1}/${params.count}`);
        await sendRawPayloadTx(params.amount);
    }
}

// ============= Main Menu Loop =============
async function mainMenu() {
    while (true) {
        displayBanner();
        displayMenu();
        
        const choice = await getUserInput("👉 Enter your choice (1-3): ");
        
        switch (choice) {
            case "1":
                try {
                    const singleParams = await getTransferParams();
                    await executeTransfers(singleParams);
                } catch (err) {
                    console.error(`\n❌ Error: ${err.message}`);
                }
                await getUserInput("\n✨ Press Enter to return to menu...");
                break;
                
            case "2":
                try {
                    const multiParams = await getTransferParams();
                    if (multiParams.count < 2) multiParams.count = 2;
                    await executeTransfers(multiParams);
                } catch (err) {
                    console.error(`\n❌ Error: ${err.message}`);
                }
                await getUserInput("\n✨ Press Enter to return to menu...");
                break;
                
            case "3":
                console.log("\n👋 Goodbye!");
                rl.close();
                process.exit(0);
                
            default:
                console.log("\n❌ Invalid choice. Please try again.");
                await sleep(1500);
        }
    }
}

// ============= Network Configuration =============
const RPC_URL = "https://evm-rpc-testnet.sei-apis.com";
const CONTRACT_ADDRESS = "0x5FbE74A283f7954f10AA04C2eDf55578811aeb03"; // Native currency transfer
const CHAIN_ID = 1328;
const NATIVE_CURRENCY = "SEI";
const BLOCK_EXPLORER = "https://seitrace.com";

// ============= Utilities =============
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Load private key from file
const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'private_keys.txt'), 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))[process.argv[3] || 0] || '';

// Validate private key
if (!PRIVATE_KEY || !ethers.isHexString(PRIVATE_KEY, 32)) {
    console.error("❌ Invalid or missing private key in private_keys.txt");
    process.exit(1);
}

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);


// ============= Core Transaction Data =============
// Exact payload (no decoding or ABI) - DO NOT MODIFY STRICT WARNING!!!
const PAYLOAD ="0xff0d7c2f000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001847a593844ad7c0c82ddebd23943e322bf17303f3ea6e97c0580f5d199029cbceb86855ef39844300000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000005af3107a40000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000001478ff133dd6be81621062971a7b0f142e9f532d51000000000000000000000000000000000000000000000000000000000000000000000000000000000000001478ff133DD6Be81621062971a7B0f142E9F532d510000000000000000000000000000000000000000000000000000000000000000000000000000000000000014eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000000000000000000000000000000000000000000000000000000000000000000035345490000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000353656900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014E86bEd5B0813430DF660D17363B89Fe9Bd8232d8000000000000000000000000";

// ============= Cryptographic Functions =============
/**
 * Generates a secure random salt using webcrypto
 * @returns {string} Hex-encoded salt
 */
function generateSalt() {
    const rawSalt = new Uint8Array(32);
    crypto.getRandomValues(rawSalt);
    return toHex(rawSalt);
}

/**
 * Generates a timeout timestamp in hex format
 * @returns {string} Hex-encoded timestamp with 24-hour timeout
 */
function generateUnionTimeoutTimestampHex() {
    const nowMs = Date.now(); // Current time in milliseconds
    const timeoutMs = nowMs + 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
    const timeoutNs = BigInt(timeoutMs) * 1_000_000n; // Convert to nanoseconds
    return timeoutNs.toString(16).padStart(64, '0'); // Pad to 64 hex characters
}

// ============= Payload Manipulation Functions =============
/**
 * Convert SEI amount to correct hex format for payload and tx value
 */
function formatSeiValue(seiAmount) {
    // Convert SEI to wei and then to hex without 0x prefix
    const weiValue = ethers.parseEther(seiAmount.toString());
    return weiValue.toString(16);
}

/**
 * Pad a number to 32-byte hex (64 characters)
 */
function to32ByteHex(num) {
    return num.toString(16).padStart(64, '0');
}

/**
 * Replace a 32-byte field in the payload
 */
function replace32ByteField(payload, oldField, newField) {
    // Remove 0x if present
    if (payload.startsWith('0x')) payload = payload.slice(2);
    if (oldField.startsWith('0x')) oldField = oldField.slice(2);
    if (newField.startsWith('0x')) newField = newField.slice(2);
    return payload.replace(oldField, newField);
}

// ============= Network Interaction Functions =============
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Query Union GraphQL API for packet hash with retries
 */
async function pollPacketHash(txHash, retries = 50, intervalMs = 5000) {
    const graphqlEndpoint = 'https://graphql.union.build/v1/graphql';
    const headers = {
        accept: 'application/graphql-response+json, application/json',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,id;q=0.8',
        'content-type': 'application/json',
        origin: 'https://app.union.build',
        referer: 'https://app.union.build/',
        'user-agent': 'Mozilla/5.0'
    };

    const data = {
        query: `query ($submission_tx_hash: String!) {
            v2_transfers(args: {p_transaction_hash: $submission_tx_hash}) {
                packet_hash
            }
        }`,
        variables: {
            submission_tx_hash: txHash.startsWith('0x') ? txHash : `0x${txHash}`
        }
    };

    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempt ${i + 1}/${retries} to get packet hash...`);
            const res = await axios.post(graphqlEndpoint, data, { headers });
            const result = res.data?.data?.v2_transfers;
            
            if (result && result.length > 0 && result[0].packet_hash) {
                console.log("Found packet hash!");
                return result[0].packet_hash;
            }
            
            console.log("Packet hash not found yet, waiting...");
            await sleep(intervalMs);
        } catch (err) {
            console.error(`Error querying packet hash: ${err.message}`);
            await sleep(intervalMs);
        }
    }
    
    console.warn(`No packet hash found after ${retries} retries.`);
    return null;
}

// ============= Core Transaction Function =============
/**
 * Main function to execute cross-chain SEI transfer transaction
 * @param {string} seiAmount - Amount of SEI to transfer
 */
async function sendRawPayloadTx(seiAmount) {
    try {
        // Format the SEI value for both payload and transaction
        const seiValueHex = formatSeiValue(seiAmount);
        
        const nonce = await provider.getTransactionCount(wallet.address, "pending");
        const feeData = await provider.getFeeData();

        // Ensure maxPriorityFeePerGas <= maxFeePerGas
        let maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("20", "gwei");
        let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits("1", "gwei");
        if (maxPriorityFeePerGas > maxFeePerGas) {
            maxPriorityFeePerGas = maxFeePerGas; // Ensure priority fee doesn't exceed max fee
        }

        // First replace timestamp
        const oldTimestamp = "0000000000000000000000000000000000000000000000001847a593844ad7c0";
        const newTimestamp = generateUnionTimeoutTimestampHex();
        let modifiedPayload = replace32ByteField(PAYLOAD, oldTimestamp, newTimestamp);

        // Then replace salt with new random value
        const oldSalt = "c82ddebd23943e322bf17303f3ea6e97c0580f5d199029cbceb86855ef398443";
        const newSalt = generateSalt().slice(2); // remove 0x prefix
        modifiedPayload = replace32ByteField(modifiedPayload, oldSalt, newSalt);

        // Replace both instances of sender wallet address
        const oldSenderWallet1 = "78ff133dd6be81621062971a7b0f142e9f532d51000000000000000000000000";
        const oldSenderWallet2 = "78ff133dd6be81621062971a7b0f142e9f532d51000000000000000000000000";
        const newSenderWallet = wallet.address.slice(2).padEnd(64, '0');
        modifiedPayload = replace32ByteField(modifiedPayload, oldSenderWallet1, newSenderWallet);
        modifiedPayload = replace32ByteField(modifiedPayload, oldSenderWallet2, newSenderWallet);

        // Replace SEI value in payload (replace both instances)
        const oldValueInPayload = "00000000000000000000000000000000000000000000000000005af3107a4000";
        const newValueInPayload = to32ByteHex(seiValueHex);
        modifiedPayload = replace32ByteField(modifiedPayload, oldValueInPayload, newValueInPayload);
        modifiedPayload = replace32ByteField(modifiedPayload, oldValueInPayload, newValueInPayload);
       
        const tx = {
            to: CONTRACT_ADDRESS,
            data: '0x' + modifiedPayload,
            value: "0x" + seiValueHex, // SEI transfer value
            gasLimit: 300000,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            nonce: nonce,
            chainId: CHAIN_ID,
        };

        console.log("\n📤 Sending transaction...");
        console.log(`💰 SEI value (wei): ${ethers.parseEther(seiAmount)}`);
        console.log(`⛽ Gas fees (SEI): maxFeePerGas=${maxFeePerGas}, maxPriorityFeePerGas=${maxPriorityFeePerGas}`);
        const txResponse = await wallet.sendTransaction(tx);
        console.log("📜 Transaction hash:", txResponse.hash);
        console.log(`🔍 View on Sei Testnet: ${BLOCK_EXPLORER}/tx/${txResponse.hash}`);

        const receipt = await txResponse.wait();
        console.log("📌 Transaction Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");

        if (receipt.status === 1) {
            console.log("\n🔍 Checking for packet hash...");
            const packetHash = await pollPacketHash(txResponse.hash);
            if (packetHash) {
                console.log("🎉 Final Packet Hash:", packetHash);
            } else {
                console.log("❌ Failed to get packet hash after maximum retries");
            }
        }
    } catch (err) {
        console.error("\n❌ Transaction Error ❌");
        console.error("Type:", err.name);
        console.error("Message:", err.message);
        if (err.data) {
            console.error("Data:", err.data);
        }
        console.error("========================");
    }
}

// Start the menu
mainMenu();