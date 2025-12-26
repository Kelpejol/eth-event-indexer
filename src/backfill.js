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
  console.error("❌ Usage: node backfill.js <fromBlock> <toBlock>");
  process.exit(1);
}

if (FROM_BLOCK > TO_BLOCK) {
  console.error("❌ fromBlock must be less than or equal to toBlock");
  process.exit(1);
}

console.log(`🔄 Backfilling events from block ${FROM_BLOCK} to ${TO_BLOCK}`);
console.log(`📝 Contract: ${config.ERC20_ADDRESS}`);

(async () => {
  try {
    const events = await contract.queryFilter(
      contract.filters.Transfer(),
      FROM_BLOCK,
      TO_BLOCK
    );

    console.log(`📊 Found ${events.length} events`);

    let indexed = 0;
    let skipped = 0;

    for (const event of events) {
      try {
        await prisma.transferEvent.create({
          data: {
            from: event.args.from,
            to: event.args.to,
            value: event.args.value.toString(),
            txHash: event.transactionHash,
            blockNum: event.blockNumber,
            timestamp: Math.floor(Date.now() / 1000)
          }
        });
        indexed++;
        
        if (indexed % 100 === 0) {
          console.log(`⏳ Progress: ${indexed}/${events.length} events indexed`);
        }
      } catch (error) {
        // Skip duplicates
        if (error.message.includes('Unique constraint')) {
          skipped++;
        } else {
          console.error(`❌ Error indexing event:`, error.message);
        }
      }
    }

    console.log(`✅ Backfill complete!`);
    console.log(`   📥 Indexed: ${indexed} events`);
    console.log(`   ⏭️  Skipped: ${skipped} events (duplicates)`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  }
})();
