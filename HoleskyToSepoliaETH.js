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
    console.log("       Union Cross-Chain Transfer Bot");
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
    const amount = await getUserInput("💰 Enter ETH amount (default: 0.00001): ");
    const delay = await getUserInput("⏰ Enter delay between transactions in seconds (default: 0): ");
    const count = await getUserInput("🔄 Enter number of transactions (default: 1): ");
    
    return {
        amount: amount || "0.00001",
        delay: (delay ? parseInt(delay) : 0) * 1000, // Convert to milliseconds
        count: count ? parseInt(count) : 1
    };
}

// ============= Enhanced Transaction Function =============
async function executeTransfers(params) {
    console.log("\n🚀 Starting transfer(s)...");
    console.log("📊 Configuration:");
    console.log(`   Amount per transfer: ${params.amount} ETH`);
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
                const singleParams = await getTransferParams();
                await executeTransfers(singleParams);
                await getUserInput("\n✨ Press Enter to return to menu...");
                break;
                
            case "2":
                const multiParams = await getTransferParams();
                if (multiParams.count < 2) multiParams.count = 2;
                await executeTransfers(multiParams);
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
const RPC_URL = "https://ethereum-holesky-rpc.publicnode.com";
const CONTRACT_ADDRESS = "0x5fbe74a283f7954f10aa04c2edf55578811aeb03";

// ============= Utilities =============
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Load private key from file
const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'private_keys.txt'), 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))[process.argv[3] || 0] || '';

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ============= Core Transaction Data =============
// Exact payload (no decoding or ABI) - DO NOT MODIFY STRICT WARNING !!!
const PAYLOAD = "0xff0d7c2f0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018474fb9da048380c1e7948530253bb4440306fc6214e93677f52fdb680e844ef32bf421c6d7ee1900000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000280000000000000000000000000000000000000000000000000000009184e72a000000000000000000000000000000000000000000000000000000000000000001478ff133dd6be81621062971a7b0f142e9f532d51000000000000000000000000000000000000000000000000000000000000000000000000000000000000001478ff133dd6be81621062971a7b0f142e9f532d510000000000000000000000000000000000000000000000000000000000000000000000000000000000000014eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000000000000000000000000000000000000000000000000000000000000000000034554480000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000545746865720000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014f6e7e2725b40ec8226036906cab0f5dc3722b8e7000000000000000000000000";

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
 * Generates a Union-compatible timeout timestamp as a 64-character hex string.
 * The timestamp is set 24 hours from now with millisecond precision,
 * resulting in a nanosecond value with six trailing zeros in decimal.
 * @returns {string} A 64-character hex string (no '0x' prefix).
 */
function generateUnionTimeoutTimestampHex() {
    const nowMs = Date.now(); // Current time in milliseconds
    const timeoutMs = nowMs + 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
    const timeoutNs = BigInt(timeoutMs) * 1_000_000n; // Convert to nanoseconds
    return timeoutNs.toString(16).padStart(64, '0'); // Pad to 64 hex characters
}

// ============= Payload Manipulation Functions =============
/**
 * Convert ETH amount to correct hex format for payload and tx value
 */
function formatEthValue(ethAmount) {
    // Convert ETH to wei and then to hex without 0x prefix
    const weiValue = ethers.parseEther(ethAmount.toString());
    return weiValue.toString(16);
}

/**
 * Pad a number to 32-byte hex
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
 * Main function to execute cross-chain transfer transaction
 * @param {string} ethAmount - Amount of ETH to transfer
 */
async function sendRawPayloadTx(ethAmount) {
    try {
        // Format the ETH value for both payload and transaction
        const ethValueHex = formatEthValue(ethAmount);
        
        const nonce = await provider.getTransactionCount(wallet.address, "pending");
        const feeData = await provider.getFeeData();

        // First replace timestamp
        const oldTimestamp = "00000000000000000000000000000000000000000000000018474fb9da048380";
        const newTimestamp = generateUnionTimeoutTimestampHex();
        let modifiedPayload = replace32ByteField(PAYLOAD, oldTimestamp, newTimestamp);

        // Then replace salt with new random value
        const oldSalt = "c1e7948530253bb4440306fc6214e93677f52fdb680e844ef32bf421c6d7ee19";
        const newSalt = generateSalt().slice(2); // remove 0x prefix
        modifiedPayload = replace32ByteField(modifiedPayload, oldSalt, newSalt);

        // Replace both instances of sender wallet address
        const oldSenderWallet1 = "78ff133dd6be81621062971a7b0f142e9f532d51000000000000000000000000";
        const oldSenderWallet2 = "78ff133dd6be81621062971a7b0f142e9f532d51000000000000000000000000";
        const newSenderWallet = wallet.address.slice(2).padEnd(64, '0');
        modifiedPayload = replace32ByteField(modifiedPayload, oldSenderWallet1, newSenderWallet);
        modifiedPayload = replace32ByteField(modifiedPayload, oldSenderWallet2, newSenderWallet);

        // Replace ETH value in payload (replace both instances)
        const oldValueInPayload = "000000000000000000000000000000000000000000000000000009184e72a000";
        const newValueInPayload = "0".repeat(64 - ethValueHex.length) + ethValueHex;
        modifiedPayload = replace32ByteField(modifiedPayload, oldValueInPayload, newValueInPayload);
        // Replace second instance of the value
        modifiedPayload = replace32ByteField(modifiedPayload, oldValueInPayload, newValueInPayload);
       
        const tx = {
            to: CONTRACT_ADDRESS,
            data: '0x' + modifiedPayload,
            value: "0x" + ethValueHex,
            gasLimit: 300000,
            maxFeePerGas: feeData.maxFeePerGas || ethers.parseUnits("20", "gwei"),
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.parseUnits("2", "gwei"),
            nonce,
            chainId: 17000,
        };

        console.log("\n📤 Sending transaction...");
        console.log("💰 ETH value (wei):", ethers.parseEther(ethAmount));
        const txResponse = await wallet.sendTransaction(tx);
        console.log("📜 Transaction hash:", txResponse.hash);
        console.log(`🔍 View on Holesky: https://holesky.etherscan.io/tx/${txResponse.hash}`);

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
