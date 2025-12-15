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

const FROM_BLOCK = Number(process.argv[2]);
const TO_BLOCK = Number(process.argv[3]);

if (!FROM_BLOCK || !TO_BLOCK) {
  console.error("Usage: node backfill.js <fromBlock> <toBlock>");
  process.exit(1);
}

(async () => {
  console.log(`Backfilling blocks ${FROM_BLOCK} → ${TO_BLOCK}`);

  const events = await contract.queryFilter(
    contract.filters.Transfer(),
    FROM_BLOCK,
    TO_BLOCK
  );

  for (const event of events) {
    try {
      await prisma.TransferEvent.create({
        data: {
          from: event.args.from,
          to: event.args.to,
          value: event.args.value.toString(),
          txHash: event.transactionHash,
          blockNum: event.blockNumber,
          timestamp: Math.floor(Date.now() / 1000)
        }
      });
    } catch {}
  }

  console.log("Backfill complete");
})();
