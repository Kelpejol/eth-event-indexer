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

console.log();

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

    console.log(`Indexed tx ${event.transactionHash}`);
  } catch (err) {
    // ignore duplicates
  }
});
