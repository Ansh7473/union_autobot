

// ============= EVM Network RPC URLs =============
const EVM_RPC = {
    SEPOLIA: "https://1rpc.io/sepolia",
    HOLESKY: "https://ethereum-holesky-rpc.publicnode.com",
    SEI_TESTNET: "https://evm-rpc-testnet.sei-apis.com",
    CORN_TESTNET: "https://21000001.rpc.thirdweb.com",
    BSC_TESTNET: "https://bsc-testnet.public.blastapi.io"
};

// ============= Cosmos Network RPC URLs =============
const COSMOS_RPC = {
    BABYLON_TESTNET: "https://babylon-testnet-rpc.nodes.guru",
    XION_TESTNET: "https://rpc.xion-testnet-2.burnt.com/",
    OSMOSIS_MAINNET: "https://rpc.osmotest5.osmosis.zone"
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
    BSC_TESTNET_RPC: EVM_RPC.BSC_TESTNET,
    BABYLON_TESTNET_RPC: COSMOS_RPC.BABYLON_TESTNET,
    XION_TESTNET_RPC: COSMOS_RPC.XION_TESTNET,
    OSMOSIS_MAINNET_RPC: COSMOS_RPC.OSMOSIS_MAINNET
};
