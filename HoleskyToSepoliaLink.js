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

// ============= Network Configuration =============
const RPC_URL = "https://ethereum-holesky-rpc.publicnode.com";
const UNION_CONTRACT_ADDRESS = "0x5fbe74a283f7954f10aa04c2edf55578811aeb03";
const LINK_CONTRACT_ADDRESS = "0x9eEB76a58A096D7EE093B90c4559348512648771";
const CHAIN_ID = 17000; // Holesky Chain ID

// Load private key
const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'private_keys.txt'), 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))[process.argv[3] || 0] || '';

if (!PRIVATE_KEY || !ethers.isHexString(PRIVATE_KEY, 32)) {
    console.error("❌ Invalid or missing private key in private_keys.txt");
    process.exit(1);
}

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ============= Menu Interface Functions =============
function displayBanner() {
    console.clear();
    console.log("\n🌉 ==================================== 🌉");
    console.log("       Holesky to Sepolia LINK Cross-Chain Transfer Bot");
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
            const cleanedAnswer = answer.trim();
            console.log(`📥 Raw input: "${answer}" | Cleaned input: "${cleanedAnswer}"`);
            resolve(cleanedAnswer);
        });
    });
}

async function getTransferParams() {
    console.log("\n📝 Transfer Configuration:");
    const amountInput = await getUserInput("💰 Enter LINK amount (default: 0.000001): ");
    const delayInput = await getUserInput("⏰ Enter delay between transactions in seconds (default: 0): ");
    const countInput = await getUserInput("🔄 Enter number of transactions (default: 1): ");

    const params = {
        amount: amountInput || "0.000001", // Default to 0.000001 LINK (10^12 units)
        delay: (delayInput ? parseInt(delayInput) : 0) * 1000, // Convert to milliseconds
        count: countInput ? parseInt(countInput) : 1
    };

    // Validate inputs
    if (isNaN(params.amount) || params.amount <= 0) {
        throw new Error("Invalid LINK amount. Must be a positive number.");
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
    console.log(`   Amount per transfer: ${params.amount} LINK`);
    console.log(`   Number of transfers: ${params.count}`);
    console.log(`   Delay between transfers: ${params.delay / 1000}s\n`);

    // Approve Union contract for total amount
    const totalAmount = ethers.parseUnits((params.amount * params.count).toString(), 18);
    await approveUnionContract(totalAmount);

    for (let i = 0; i < params.count; i++) {
        if (i > 0) {
            console.log(`\n⏳ Waiting for ${params.delay / 1000} seconds before next transfer...`);
            await sleep(params.delay);
        }
        console.log(`\n🔄 Executing transfer ${i + 1}/${params.count}`);
        await sendRawPayloadTx(params.amount);
    }
}

// ============= Approval Function =============
async function approveUnionContract(amountInUnits) {
    console.log("\n📝 Approving Union contract to spend LINK...");
    const amountHex = to32ByteHex(amountInUnits.toString(16));
    const callData = `0x095ea7b3${UNION_CONTRACT_ADDRESS.slice(2).padStart(64, '0')}${amountHex}`;

    const nonce = await provider.getTransactionCount(wallet.address, "pending");
    const feeData = await provider.getFeeData();

    let maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("20", "gwei");
    let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits("2", "gwei");
    if (maxPriorityFeePerGas > maxFeePerGas) {
        maxPriorityFeePerGas = maxFeePerGas;
    }

    const tx = {
        to: LINK_CONTRACT_ADDRESS,
        data: callData,
        value: 0,
        gasLimit: ethers.toBigInt("0x12b85"), // From provided call data
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        chainId: CHAIN_ID
    };

    console.log(`📤 Approving ${ethers.formatUnits(amountInUnits, 18)} LINK...`);
    const txResponse = await wallet.sendTransaction(tx);
    console.log("📜 Approval transaction hash:", txResponse.hash);
    const receipt = await txResponse.wait();
    console.log("📌 Approval Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");

    if (receipt.status !== 1) {
        throw new Error("Approval transaction failed.");
    }
}

// ============= Core Transaction Data =============
// Payload adjusted for LINK (same as USDC, updated for token address)
const PAYLOAD = "0xff0d7c2f0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018480aa568870b4076c0014de1f1ac8f1b17facdfcee643c281a437230c528e018aeef439e2d135300000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000280000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000000000000000001478ff133dd6be81621062971a7b0f142e9f532d51000000000000000000000000000000000000000000000000000000000000000000000000000000000000001478ff133dd6be81621062971a7b0f142e9f532d5100000000000000000000000000000000000000000000000000000000000000000000000000000000000000149eeb76a58a096d7ee093b90c455934851264877100000000000000000000000000000000000000000000000000000000000000000000000000000000000000044c494e4b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f436861696e4c696e6b20546f6b656e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014779877a7b0d9e8603169ddbd7836e478b4624789000000000000000000000000";

// ============= Cryptographic Functions =============
function generateSalt() {
    const rawSalt = new Uint8Array(32);
    crypto.getRandomValues(rawSalt);
    return toHex(rawSalt);
}

function generateUnionTimeoutTimestampHex() {
    const nowMs = Date.now(); // Current time in milliseconds
    const timeoutMs = nowMs + 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
    const timeoutNs = BigInt(timeoutMs) * 1_000_000n; // Convert to nanoseconds
    return timeoutNs.toString(16).padStart(64, '0'); // Pad to 64 hex characters
}

// ============= Payload Manipulation Functions =============
function formatLinkValue(linkAmount) {
    // Convert LINK to units (18 decimals) and then to hex without 0x prefix
    const units = ethers.parseUnits(linkAmount.toString(), 18);
    return units.toString(16);
}

function to32ByteHex(num) {
    return num.toString(16).padStart(64, '0');
}

function replace32ByteField(payload, oldField, newField) {
    if (payload.startsWith('0x')) payload = payload.slice(2);
    if (oldField.startsWith('0x')) oldField = oldField.slice(2);
    if (newField.startsWith('0x')) newField = newField.slice(2);
    const regex = new RegExp(oldField, 'i');
    const result = payload.replace(regex, newField);
    if (result === payload) {
        console.warn(`Warning: No replacement occurred for field ${oldField}`);
    }
    return result;
}

// ============= Network Interaction Functions =============
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
async function sendRawPayloadTx(linkAmount) {
    try {
        // Format the LINK value for payload
        const linkValueHex = formatLinkValue(linkAmount);

        const nonce = await provider.getTransactionCount(wallet.address, "pending");
        const feeData = await provider.getFeeData();

        let maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("20", "gwei");
        let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits("2", "gwei");
        if (maxPriorityFeePerGas > maxFeePerGas) {
            maxPriorityFeePerGas = maxFeePerGas;
        }

        // Replace timestamp
        const oldTimestamp = "00000000000000000000000000000000000000000000000018480aa568870b40";
        const newTimestamp = generateUnionTimeoutTimestampHex();
        let modifiedPayload = replace32ByteField(PAYLOAD, oldTimestamp, newTimestamp);

        // Replace salt
        const oldSalt = "76c0014de1f1ac8f1b17facdfcee643c281a437230c528e018aeef439e2d1353";
        const newSalt = generateSalt().slice(2);
        modifiedPayload = replace32ByteField(modifiedPayload, oldSalt, newSalt);

        // Replace sender wallet address (twice)
        const oldSenderWallet = "78ff133dd6be81621062971a7b0f142e9f532d51000000000000000000000000";
        const newSenderWallet = wallet.address.slice(2).padEnd(64, '0');
        modifiedPayload = replace32ByteField(modifiedPayload, oldSenderWallet, newSenderWallet);
        modifiedPayload = replace32ByteField(modifiedPayload, oldSenderWallet, newSenderWallet);

        // Replace LINK value in payload (twice)
        const oldValueInPayload = "000000000000000000000000000000000000000000000000016345785d8a0000";
        const newValueInPayload = to32ByteHex(linkValueHex);
        modifiedPayload = replace32ByteField(modifiedPayload, oldValueInPayload, newValueInPayload);
        modifiedPayload = replace32ByteField(modifiedPayload, oldValueInPayload, newValueInPayload);

        const tx = {
            to: UNION_CONTRACT_ADDRESS,
            data: '0x' + modifiedPayload,
            value: 0, // No ETH for ERC-20 transfer
            gasLimit: 300000,
            maxFeePerGas,
            maxPriorityFeePerGas,
            nonce,
            chainId: CHAIN_ID
        };

        console.log("\n📤 Sending transaction...");
        console.log(`💰 LINK amount (units): ${ethers.parseUnits(linkAmount, 18)}`);
        console.log(`⛽ Gas fees (ETH): maxFeePerGas=${maxFeePerGas}, maxPriorityFeePerGas=${maxPriorityFeePerGas}`);
        console.log(`🔐 Sender: ${wallet.address}`);
        console.log(`🧂 Salt: 0x${newSalt}`);
        console.log(`⏰ Timestamp: 0x${newTimestamp}`);
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
        console.error("Modified Payload:", `0x${modifiedPayload}`);
        console.error("========================");
    }
}

// ============= Main Menu Loop =============
async function mainMenu() {
    while (true) {
        displayBanner();
        displayMenu();
        const choice = await getUserInput("Select an option (1, 2, or 3): ");
        if (choice === "1") {
            try {
                const params = await getTransferParams();
                await executeTransfers(params);
            } catch (err) {
                console.error("❌", err.message);
            }
            await getUserInput("\nPress Enter to return to menu...");
        } else if (choice === "2") {
            try {
                const params = await getTransferParams();
                await executeTransfers(params);
            } catch (err) {
                console.error("❌", err.message);
            }
            await getUserInput("\nPress Enter to return to menu...");
        } else if (choice === "3") {
            console.log("👋 Exiting. Goodbye!");
            rl.close();
            process.exit(0);
        } else {
            console.log("❌ Invalid option. Please select 1, 2, or 3.");
            await getUserInput("\nPress Enter to return to menu...");
        }
    }
}

// Export for index.js
module.exports = { mainMenu };

if (require.main === module) {
    mainMenu();
}