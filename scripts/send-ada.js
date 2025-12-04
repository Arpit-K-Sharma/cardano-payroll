import { Lucid, Blockfrost } from "lucid-cardano";

// Arguments from Java
const API_KEY = process.argv[2];
const PRIVATE_KEY = process.argv[3];
const TO_ADDRESS = process.argv[4];
const AMOUNT = process.argv[5];

if (!API_KEY || !PRIVATE_KEY || !TO_ADDRESS || !AMOUNT) {
  console.error("Missing arguments");
  process.exit(1);
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 8000;

async function main() {
  let attempt = 1;
  while (attempt <= MAX_ATTEMPTS) {
    try {
      const txHash = await submitPayment();
      console.log("TX_HASH=" + txHash);
      return;
    } catch (err) {
      const message = err?.message || String(err);
      console.error(`FAILED_ATTEMPT_${attempt}:`, message);

      if (attempt === MAX_ATTEMPTS || !isRetryable(message)) {
        console.error("FAILED:", message);
        process.exit(1);
      }

      console.log(
        `Retrying in ${RETRY_DELAY_MS / 1000}s to avoid reusing spent UTxOs...`
      );
      await delay(RETRY_DELAY_MS);
      attempt++;
    }
  }
}

function isRetryable(message) {
  if (!message) return false;
  return (
    message.includes("BadInputsUTxO") ||
    message.includes("ValueNotConservedUTxO") ||
    message.includes("InsufficientFundsUTxO")
  );
}

async function submitPayment() {
  const lucid = await Lucid.new(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", API_KEY),
    "Preprod"
  );

  lucid.selectWalletFromPrivateKey(PRIVATE_KEY);

  const companyAddr = await lucid.wallet.address();
  console.log("COMPANY_ADDRESS=" + companyAddr);

  const lovelace = BigInt(Math.floor(parseFloat(AMOUNT) * 1_000_000));

  const tx = await lucid
    .newTx()
    .payToAddress(TO_ADDRESS, { lovelace })
    .complete();

  const signed = await tx.sign().complete();
  const txHash = await signed.submit();

  console.log("WAITING_FOR_CONFIRMATION=" + txHash);
  await lucid.awaitTx(txHash);
  console.log("CONFIRMED=" + txHash);

  return txHash;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error("FAILED:", err?.message || err);
  process.exit(1);
});
