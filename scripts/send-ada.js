import { Lucid, Blockfrost } from "lucid-cardano";

// Arguments from Java
const API_KEY = process.argv[2];
const PRIVATE_KEY = process.argv[3];
const PAYMENT_DATA = process.argv[4]; // Format: "addr1,10;addr2,20;addr3,15"

if (!API_KEY || !PRIVATE_KEY || !PAYMENT_DATA) {
  console.error("Missing arguments");
  process.exit(1);
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 8000;

async function main() {
  let attempt = 1;
  while (attempt <= MAX_ATTEMPTS) {
    try {
      const txHash = await submitBatchPayment();
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

async function submitBatchPayment() {
  const lucid = await Lucid.new(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", API_KEY),
    "Preprod"
  );

  lucid.selectWalletFromPrivateKey(PRIVATE_KEY);

  const companyAddr = await lucid.wallet.address();
  console.log("COMPANY_ADDRESS=" + companyAddr);

  // Parse payment data: "addr1,10;addr2,20;addr3,15"
  const payments = PAYMENT_DATA.split(";").map(entry => {
    const [address, amount] = entry.split(",");
    return {
      address: address.trim(),
      lovelace: BigInt(Math.floor(parseFloat(amount) * 1_000_000))
    };
  });

  console.log(`Processing ${payments.length} payments in single transaction`);

  // Build transaction with multiple outputs
  let tx = lucid.newTx();
  
  for (const payment of payments) {
    tx = tx.payToAddress(payment.address, { lovelace: payment.lovelace });
    console.log(`Added output: ${payment.lovelace / 1_000_000n} ADA to ${payment.address}`);
  }

  const completedTx = await tx.complete();
  const signed = await completedTx.sign().complete();
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