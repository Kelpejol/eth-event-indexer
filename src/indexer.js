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

async function getLastBlock() {
  const state = await prisma.IndexerState.findUnique({ where: { id: 1 } });
  return state?.lastBlock ?? (await provider.getBlockNumber());
}

async function saveLastBlock(block) {
  await prisma.IndexerState.upsert({
    where: { id: 1 },
    update: { lastBlock: block },
    create: { id: 1, lastBlock: block }
  });
}

console.log("🔁 Starting indexer...");

contract.on("Transfer", async (from, to, value, event) => {
  try {
    await prisma.TransferEvent.create({
      data: {
        from,
        to,
        value: value.toString(),
        txHash: event.transactionHash,
        blockNum: event.blockNumber,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });

    await saveLastBlock(event.blockNumber);
    console.log(`Indexed tx ${event.transactionHash}`);
  } catch {}
});
