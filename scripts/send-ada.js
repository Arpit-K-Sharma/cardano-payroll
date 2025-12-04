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

async function main() {
  const lucid = await Lucid.new(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", API_KEY),
    "Preprod"
  );

  // Load wallet
  lucid.selectWalletFromPrivateKey(PRIVATE_KEY);

  const companyAddr = await lucid.wallet.address();
  console.log("COMPANY_ADDRESS=" + companyAddr);

  const lovelace = BigInt(Math.floor(parseFloat(AMOUNT) * 1_000_000));

  // Build TX
  const tx = await lucid
    .newTx()
    .payToAddress(TO_ADDRESS, { lovelace })
    .complete();

  // Sign & submit
  const signed = await tx.sign().complete();
  const txHash = await signed.submit();

  // Wait for confirmation so subsequent payroll payments don't reuse the same UTxO
  console.log("WAITING_FOR_CONFIRMATION=" + txHash);
  await lucid.awaitTx(txHash);
  console.log("CONFIRMED=" + txHash);

  // ONLY PRINT HASH (so Java can capture)
  console.log("TX_HASH=" + txHash);
}

main().catch(err => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
