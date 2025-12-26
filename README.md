# 🔷 Ethereum Event Indexer

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-blue.svg)](https://www.prisma.io/)

A production-ready Ethereum event indexer that listens to on-chain events, stores them off-chain, and exposes a query API.

## 🎯 Why This Exists

Most blockchain applications require **reliable off-chain indexing**:

- ⚡ **Fast Queries** - Query blockchain data at database speed
- 📊 **Historical Data** - Access complete event history
- 🔍 **Advanced Filtering** - Complex queries not possible on-chain
- 💰 **Cost Efficient** - No RPC rate limits or costs for queries

This project demonstrates a clean, minimal pipeline for syncing on-chain data into queryable infrastructure.

## ✨ Features

- 🎧 **Real-time Event Listening** - Uses ethers.js WebSocket provider
- 💾 **Persistent Storage** - SQLite/PostgreSQL via Prisma
- 🔄 **Automatic Backfilling** - Fill historical gaps
- 🔁 **Checkpoint System** - Resume from last indexed block
- 📡 **REST API** - Query indexed events
- 🐳 **Docker Ready** - Easy deployment
- 🧪 **Well Tested** - Comprehensive test suite

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/kelpejol/ethereum-event-indexer.git
cd ethereum-event-indexer

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your RPC URL and contract address

# Initialize database
npx prisma migrate dev

# Start indexer
npm run start:indexer

# In another terminal, start API server
npm run start:api
```

### Docker

```bash
docker-compose up -d
```

### First API Call

```bash
# Get transfers for an address
curl "http://localhost:3000/transfers?address=0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
```

## 📖 API Documentation

### GET `/transfers`

Query indexed transfer events.

**Parameters:**
- `address` (optional) - Filter by from/to address
- `limit` (optional) - Number of results (default: 50)

**Response:**
```json
[
  {
    "id": 1,
    "from": "0x...",
    "to": "0x...",
    "value": "1000000000000000000",
    "txHash": "0x...",
    "blockNum": 12345678,
    "timestamp": 1234567890
  }
]
```

## 🏗️ Architecture

```
Ethereum Node
     ↓
Event Listener (ethers.js)
     ↓
SQLite/PostgreSQL Database (Prisma)
     ↓
REST API (Express)
```

### Components

1. **Indexer** (`src/indexer.js`) - Listens to events and saves to DB
2. **Backfill** (`src/backfill.js`) - Fills historical event data
3. **Server** (`src/server.js`) - Exposes query API
4. **Database** (`prisma/schema.prisma`) - Data models

## 📊 Database Schema

```prisma
model TransferEvent {
  id        Int      @id @default(autoincrement())
  from      String
  to        String
  value     String
  txHash    String   @unique
  blockNum  Int
  timestamp Int
}

model IndexerState {
  id        Int @id @default(1)
  lastBlock Int
}
```

## 🔄 Backfilling Historical Data

```bash
# Backfill from block 18000000 to 18001000
npm run backfill 18000000 18001000
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test tests/indexer.test.js
```

## 🛠️ Development

```bash
# Install dev dependencies
npm install

# Run linter
npm run lint

# Format code
npm run format

# Watch mode for development
npm run dev
```

## 📦 Deployment

### Environment Variables

```bash
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ERC20_ADDRESS=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
DATABASE_URL=postgresql://user:password@localhost:5432/indexer
PORT=3000
```

### Production with Docker

```bash
# Build
docker build -t eth-indexer .

# Run
docker run -d \
  -p 3000:3000 \
  -e RPC_URL=$RPC_URL \
  -e ERC20_ADDRESS=$ERC20_ADDRESS \
  eth-indexer
```

### With PostgreSQL

```bash
# Update .env
DATABASE_URL=postgresql://user:password@localhost:5432/indexer

# Migrate database
npx prisma migrate deploy

# Start services
npm run start
```

## 🔍 Monitoring

- **Health Check**: `GET /health`
- **Stats**: `GET /stats` - Total events, last block, etc.
- **Logs**: Check console output or configure logging service

## ⚠️ Reliability Considerations

### Handled

- ✅ **Checkpointing** - Resumes from last indexed block
- ✅ **Idempotent Storage** - Duplicate events handled via unique constraints
- ✅ **Error Recovery** - Automatic reconnection on RPC failures

### Not Handled

- ❌ **Chain Reorgs** - No reorg detection (consider using finalized blocks)
- ❌ **Rate Limiting** - May hit RPC provider limits during backfill
- ❌ **Multi-Contract** - Currently indexes single contract

## 🎯 Use Cases

- 📊 **Analytics Dashboards** - Historical transfer analysis
- 🔔 **Notification Systems** - Alert on specific events
- 📈 **Trading Bots** - Monitor token movements
- 🔍 **Block Explorers** - Custom contract explorers
- 📱 **DApp Backends** - Serve event data to frontends


## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- [ethers.js](https://docs.ethers.org/) - Ethereum library
- [Prisma](https://www.prisma.io/) - Database ORM
- [Express](https://expressjs.com/) - Web framework


## 🗺️ Future Enhancements

- [ ] Multi-contract support
- [ ] Reorg detection and handling
- [ ] WebSocket API for real-time updates
- [ ] GraphQL endpoint
- [ ] Horizontal scaling support
- [ ] Built-in monitoring dashboard
- [ ] Automatic ABI detection

---

**Built for reliability and ease of use** ⚡
