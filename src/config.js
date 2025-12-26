import 'dotenv/config';

export const config = {
  RPC_URL: process.env.RPC_URL || 'http://localhost:8545',
  ERC20_ADDRESS: process.env.ERC20_ADDRESS,
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  PORT: process.env.PORT || 3000,
};

// Validation
if (!config.ERC20_ADDRESS) {
  console.error('❌ ERC20_ADDRESS environment variable is required');
  process.exit(1);
}
