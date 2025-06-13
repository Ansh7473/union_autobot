/**
 * RPC Configuration for UNION Cross-Chain Automation
 */

// ============= EVM Network RPC URLs =============
const EVM_RPC = {
    SEPOLIA: "https://1rpc.io/sepolia",
    HOLESKY: "https://ethereum-holesky-rpc.publicnode.com",
    SEI_TESTNET: "https://evm-rpc-testnet.sei-apis.com",
    CORN_TESTNET: "https://21000001.rpc.thirdweb.com"
};

// ============= Cosmos Network RPC URLs =============
const COSMOS_RPC = {
    BABYLON_TESTNET: "https://babylon-testnet-rpc.nodes.guru",
    XION_TESTNET: "https://rpc.xion-testnet-2.burnt.com/"
};

// ============= Exports =============
module.exports = {
    EVM_RPC,
    COSMOS_RPC,
    
    // Direct access
    SEPOLIA_RPC: EVM_RPC.SEPOLIA,
    HOLESKY_RPC: EVM_RPC.HOLESKY,
    SEI_TESTNET_RPC: EVM_RPC.SEI_TESTNET,
    CORN_TESTNET_RPC: EVM_RPC.CORN_TESTNET,
    BABYLON_TESTNET_RPC: COSMOS_RPC.BABYLON_TESTNET,
    XION_TESTNET_RPC: COSMOS_RPC.XION_TESTNET
};
