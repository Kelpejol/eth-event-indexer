import express from 'express';
import { prisma } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

/**
 * Get transfer events
 * Query params:
 * - address: filter by from/to address
 * - limit: number of results (default: 50, max: 1000)
 */
app.get('/transfers', async (req, res) => {
  try {
    const { address, limit = 50 } = req.query;
    const limitNum = Math.min(Number(limit), 1000);

    const where = address ? {
      OR: [
        { from: address },
        { to: address }
      ]
    } : {};

    const transfers = await prisma.transferEvent.findMany({
      where,
      orderBy: { blockNum: 'desc' },
      take: limitNum
    });

    res.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

/**
 * Get indexer stats
 */
app.get('/stats', async (req, res) => {
  try {
    const [totalEvents, lastEvent, indexerState] = await Promise.all([
      prisma.transferEvent.count(),
      prisma.transferEvent.findFirst({
        orderBy: { blockNum: 'desc' }
      }),
      prisma.indexerState.findUnique({ where: { id: 1 } })
    ]);

    res.json({
      totalEvents,
      lastBlock: lastEvent?.blockNum || 0,
      checkpointBlock: indexerState?.lastBlock || 0,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Get transfer by transaction hash
 */
app.get('/transfer/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    
    const transfer = await prisma.transferEvent.findUnique({
      where: { txHash }
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Error fetching transfer:', error);
    res.status(500).json({ error: 'Failed to fetch transfer' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET /transfers?address=0x... - Query transfers`);
  console.log(`   GET /stats - Get indexer statistics`);
  console.log(`   GET /transfer/:txHash - Get specific transfer`);
});
