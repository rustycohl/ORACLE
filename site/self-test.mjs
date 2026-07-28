import { appendEvent, verifyLedger } from "./lib/ledger.mjs";
import {
  claimOracleIdentity,
  createOracleIdentity,
  verifyIdentityClaim,
} from "./lib/oracle.mjs";

export async function runSelfTest() {
  const ghost = await createOracleIdentity();
  let ledger = await appendEvent([], ghost, "ORACLE_GHOST_ENTERED", {
    mode: "server-card-self-test",
  });
  const claimed = await claimOracleIdentity(ghost, "Port Test");
  ledger = await appendEvent(ledger, claimed, "ORACLE_SESSION_CLAIMED", {
    claim: claimed.claim,
  });
  const claimValid = await verifyIdentityClaim(claimed);
  const ledgerReport = await verifyLedger(ledger);
  return {
    pass: claimValid && ledgerReport.valid,
    summary: "Ghost → claim → signed evidence",
    checks: [
      { name: "Ed25519 claim", pass: claimValid },
      { name: "Hash-linked ledger", pass: ledgerReport.valid },
    ],
    evidence: {
      oracle_id: claimed.oracle_id,
      events: ledgerReport.count,
      chain_status: "unanchored",
    },
  };
}
