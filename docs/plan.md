# Private Identity + Private Auction MVP - Step-by-Step Plan

## Roles (Suggested)

- **Product Lead / PM** — Organize, prioritize, invite testers
- **Tech Lead / Architect** — Overall system design, security, Zama integration
- **Smart-Contract Dev** — Solidity + fhEVM types + tests
- **Frontend Dev** — React UI, wallet flows, encryption helper code
- **Backend / DevOps** — Gateway orchestrator, IPFS integration, event watchers
- **Crypto / Security Engineer** — FHE/coprocessor integration, proof verification, KMS threat modeling
- **QA / Testers** — Run testnet experiments, usability testing, bug reporting
- **Community / Growth** — Invite alpha users, create docs, run closed alpha

*If a person wears two hats, tag tasks accordingly.*

---

## Phase 0 — Project Setup (Create the Workspace)

**Goals:** Create repo, communication, issue templates, minimal docs.

### Tasks
- Create GitHub org + 3 repos: contracts, frontend, backend
- Setup channels: Discord/Slack, and a shared Google Drive / Notion for docs
- Add README in each repo with "How to run locally" (placeholder)
- Create issue & PR templates, labels (todo, in-progress, blocked, security, urgent)
- Create Milestones: phase-0-setup, phase-1-mvp, phase-2-id-msg, alpha-launch
- Create project board (Kanban) and invite collaborators

**Owners:** PM + Tech Lead  
**Deliverable:** Repos + communication channels + onboarding doc  
**Acceptance:** All collaborators can clone repos, open issues, and send PRs

---

## Phase 1 — Architecture & Specs (Design Before Coding)

**Goals:** Finalize architecture, sequence diagrams, contract APIs, and MVP scope.

### Tasks
- **Tech Lead:** Produce architecture diagram and sequence diagram for bid flow & identity flow
- **Product Lead:** Write clear MVP spec (NFT auctions only, sealed bids, identity gating, auction timings)
- **Smart-Contract Dev + Crypto Engineer:** Draft Solidity pseudocode for Identity + Auction contracts with placeholder fhEVM types. Include events for Gateway triggers
- **Backend Dev:** Define Gateway API endpoints and coprocessor interaction points
- **Frontend Dev:** Define wireframes for signup, create auction, submit bid, auction page, and notifications
- **Security Engineer:** Quick threat model draft focusing on KMS, coprocessor side channels, key handling, and user keys

**Owners:** Tech Lead + Smart-Contract Dev + Frontend  
**Deliverable:** Design doc + contract API + wireframes + threat model  
**Acceptance:** Team signs off on doc and tasks split into issues

---

## Phase 2 — Core Smart Contracts & Local Simulation

**Goals:** Get core contracts deployed on a local chain and simulate flows without Zama integration (placeholders for ciphertext).

### Tasks
- **Smart-Contract Dev:** Implement Identity contract skeleton:
  - `registerIdentity(encryptedPtr, zkAttestation)`
  - `isEligible(address) view returns (bool)` (initially toggled by dev/admin)
- **Smart-Contract Dev:** Implement Auction contract skeleton:
  - `createAuction(...)`, `submitBid(pointer)`, `closeAuction()`, `settle(...)`
  - Emit events `BidSubmitted`, `AuctionClosed`, `WinnerRevealed`
- **Tests:** Unit tests with Hardhat/Foundry for basic flows using fake data
- **DevOps:** Setup local Hardhat network and scripts for deploy
- **Frontend:** Build minimal pages to call contract functions using a wallet — client encrypt helper returns dummy ciphertext for now

**Owners:** Smart-Contract Dev + Frontend + DevOps  
**Deliverable:** Contracts deployed to local testnet + basic front end working with dummy ciphertext  
**Acceptance:** End-to-end simulated auction flow works locally

---

## Phase 3 — Zama Integration POC (Testnet)

**Goals:** Integrate real ciphertext submission and call Zama Gateway; get coprocessor produce a mock proof; do threshold decrypt for winner only.

### Tasks
- **Backend:** Implement Gateway orchestration service that:
  - Listens to `BidSubmitted` events > fetch ciphertext pointer > submit to Zama Gateway / Coprocessor (testnet)
  - Calls coprocessor compute endpoint when `AuctionClosed` event triggers
- **Crypto Engineer:** Build client-side encryption module to encrypt bid with auction public key
- **Zama Integration:** Connect to Zama testnet endpoints; run sample compute and obtain ZK proof
- **Backend:** Call KMS threshold decrypt for winner ciphertext and publish winner result with proof to chain via `settle`
- **Frontend:** UX to show "waiting for compute" and display winner once settled
- **Tests & Logging:** Log timings & costs for each step

**Owners:** Backend + Crypto Engineer + Smart-Contract Dev  
**Deliverable:** End-to-end auction where bids are encrypted, coprocessor computes winner, winner revealed on-chain with proof  
**Acceptance:** Two users can run sealed-bid auction on Zama testnet; proof verifiable on-chain

---

## Phase 4 — Identity Verification & Anti-Sybil Controls

**Goals:** Implement real identity attestations and on-chain gating for creating auctions.

### Tasks
- **Identity Verifier integration:**
  - Integrate with at least one attestation provider
  - Implement signing of attestations
- **Identity Contract:** Accept attestation and set eligibility flag. Enable `createAuction()` to require eligibility
- **Bond & Rate Limiting:**
  - Implement refundable bond logic in `createAuction()` to discourage spam
  - Basic reputation counter for successful auctions
  - Sybil defenses: Add optional captcha/social proofs

**Owners:** Smart-Contract Dev + Backend + Community  
**Deliverable:** Verified identities can create auctions; bonds enforced  
**Acceptance:** Only eligible accounts can create auctions; bonds refundable on success

---

## Phase 5 — UI Polish, Testing & Security Audit Prep

**Goals:** Polish UX, run full QA, prepare for external security audit.

### Tasks
- **Frontend:** Polish all flows, add notifications, friendly error handling for compute delays, show proof status
- **QA:** Test edge-cases, coprocessor unavailability, KMS failure scenarios, partial failures
- **Load tests:** Simulate auctions and bids to measure cost & throughput
- **Security:** Internal audit / code review; fix issues. Prepare audit brief + threat model
- **Analytics & monitoring:** Log compute times, Zama fees, host-chain gas usage

**Owners:** QA + Security Engineer + Frontend + Backend  
**Deliverable:** Polished app, test reports, audit prep docs  
**Acceptance:** No critical vulnerabilities; known issues documented

---

## Phase 6 — Closed Alpha Launch

**Goals:** Run a private alpha with friends & invited users, collect feedback and metrics.

### Tasks
- Create alpha invites and onboarding guide
- Run 10–50 auctions with invited users; collect feedback on latency, costs, UX
- Triage bugs, fix urgent issues
- Measure success metrics: number of auctions, bid submission success rate, average compute latency, cost per auction
- Decide go/no-go for public beta

**Owners:** Community + QA + PM  
**Deliverable:** Alpha feedback report, bug fixes, metric dashboard  
**Acceptance:** Key functionality stable; no major security issues; user feedback positive enough to continue

---

## Phase 7 — Public Beta & Growth

**Goals:** Open to public, refine monetization, onboard verifiers & partners.

### Tasks
- Finalize fee model + commissions + Zama fee reimbursement plan
- Onboard more identity verifiers and KYC partners
- Build welcome flows, docs, marketing site, demo videos
- Monitor & scale infrastructure, plan GPU/FPGA partners for coprocessor scaling
- Start thinking about Identity + Messaging integration

**Owners:** PM + Community + Backend + Partnerships  
**Deliverable:** Public beta, revenue model, partner agreements  
**Acceptance:** Platform can operate under increased load; revenue tests start

---

## Cross-cutting Items (Ongoing)

- **Project management:** Weekly sprint planning + daily async updates in channel
- **Security & audits:** Continuous. Schedule formal smart contract audit before public launch
- **Documentation:** Keep API docs, onboarding guides, and dev docs updated
- **Legal:** Consult on terms of service, KYC/AML requirements, and data protection policies
- **Metrics:** Track key metrics from day 1 (auctions, bids, compute time, fees)

---

## Ready-to-Share Invite Message

Hey — I'm launching a private auction + private identity project (MVP): sealed-bid NFT auctions where bids are encrypted and only the winner + final price are revealed. We'll use Zama for confidential computation. Looking for collaborators for a closed alpha: roles needed — Smart-Contract Dev, Frontend Dev, Backend Dev, Crypto/Security Engineer, QA. If you're in, I'll add you to the GitHub org and our Discord. First sprint: repo setup + architecture spec. Ping me and I'll add you.

---

## Quick Starter Checklist to Send Collaborators

- Accept GitHub invite & clone contracts repo
- Join Discord/Slack
- Run `npm install` in frontend and `yarn` in contracts (once repos created)
- Read `ARCHITECTURE.md` in root
- Pick 1 issue from phase-0-setup and comment "I'll take this"
