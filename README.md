# Ethereum Event Indexer

A minimal Ethereum event indexer that listens to on-chain events,
stores them off-chain, and exposes a query API.

## Architecture

Ethereum Node
   ↓
Event Listener (ethers.js)
   ↓
SQLite Database
   ↓
HTTP API

## Why This Exists

Most blockchain applications require reliable off-chain indexing.
This project demonstrates a clean, minimal pipeline for syncing
on-chain data into queryable infrastructure.

## Features

- Real-time event listening
- Idempotent storage
- Simple query API
- Easily extensible to other events

## Run Locally

1. Set environment variables
2. Start indexer
3. Start API server

## Future Work

- Reorg handling
- Backfilling historical events
- Postgres support
- Metrics & monitoring
