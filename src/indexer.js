import { ethers } from 'ethers';
import { prisma } from './db.js';
import { config } from './config.js';

const provider = new ethers.JsonRpcProvider(config.RPC_URL);

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const contract = new ethers.Contract(
  config.ERC20_ADDRESS,
  ERC20_ABI,
  provider
);

/**
 * Get last indexed block from database
 * @returns {Promise<number>} Last block number
 */
async function getLastBlock() {
  const state = await prisma.indexerState.findUnique({ where: { id: 1 } });
  return state?.lastBlock ?? (await provider.getBlockNumber());
}

/**
 * Save last indexed block to database
 * @param {number} block - Block number to save
 */
async function saveLastBlock(block) {
  await prisma.indexerState.upsert({
    where: { id: 1 },
    update: { lastBlock: block },
    create: { id: 1, lastBlock: block }
  });
}

console.log("🔁 Starting Ethereum event indexer...");
console.log(`📡 RPC: ${config.RPC_URL}`);
console.log(`📝 Contract: ${config.ERC20_ADDRESS}`);

// Listen to Transfer events
contract.on("Transfer", async (from, to, value, event) => {
  try {
    await prisma.transferEvent.create({
      data: {
        from,
        to,
        value: value.toString(),
        txHash: event.log.transactionHash,
        blockNum: event.log.blockNumber,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });

    await saveLastBlock(event.log.blockNumber);
    console.log(`✅ Indexed tx ${event.log.transactionHash} at block ${event.log.blockNumber}`);
  } catch (error) {
    // Ignore duplicate errors (unique constraint on txHash)
    if (!error.message.includes('Unique constraint')) {
      console.error('❌ Error indexing event:', error.message);
    }
  }
});

// Error handling
contract.provider.on("error", (error) => {
  console.error("🚨 Provider error:", error);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

console.log("✅ Indexer started successfully");
