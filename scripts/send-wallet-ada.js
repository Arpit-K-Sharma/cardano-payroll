const KUBER_API_URL = process.argv[2] || "https://preprod.kuber.cardanoapi.io";
const KUBER_API_KEY = process.argv[3] || "";
const signedTxCbor = process.argv[4];

if (!signedTxCbor) {
  console.error("Missing signedTxCbor argument");
  process.exit(1);
}

import { KuberApiProvider } from "kuber-client";

async function main() {
  const kuber = new KuberApiProvider(KUBER_API_URL, KUBER_API_KEY);
  try {
    const result = await kuber.submitTx(signedTxCbor);
    console.log("TX_HASH=" + (result.hash || result.txHash || result));
  } catch (err) {
    console.error("FAILED:", err?.message || err);
    process.exit(1);
  }
}

main();