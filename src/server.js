import express from 'express';
import { prisma } from './db.js';

const app = express();
app.use(express.json());

app.get('/transfers', async (req, res) => {
  const { address } = req.query;

  const transfers = await prisma.TransferEvent.findMany({
    where: {
      OR: [
        { from: address },
        { to: address }
      ]
    },
    orderBy: { blockNum: 'desc' },
    take: 50
  });

  res.json(transfers);
});

app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
