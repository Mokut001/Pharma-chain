# PharmaChain: Medication Traceability DApp

PharmaChain solves the problem of counterfeit medications using Cardano blockchain's Native Assets and Smart Contracts (Haskell/Plutus).

## Problem Solved
Counterfeit drugs kill thousands annually. PharmaChain allows manufacturers to mint "PharmaNFTs" for every batch. Pharmacies scan/verify these tokens to ensure the medicine is genuine.

## Structure
- `/contracts`: Haskell Plutus source code for the Minting Policy.
- `/public`: Frontend deployed via Vercel (HTML/JS/Lucid).

## Deployment (Frontend)
1. Push this folder to GitHub.
2. Connect GitHub to Vercel.
3. Add `BLOCKFROST_PROJECT_ID` as an environment variable.
4. Deploy!

## How to use
1. **Manufacturer**: Connect Nami wallet, fill in batch details, and mint the batch token.
2. **Pharmacy**: Take the Policy ID of the batch and enter it into the Verify section. Verification happens on-chain.