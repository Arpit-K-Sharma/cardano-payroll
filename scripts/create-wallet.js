import { Lucid, Blockfrost } from "lucid-cardano";

const BLOCKFROST_PROJECT_ID = "preproduKedpQ9PItnF65yf9aelplsJiD5YrXU8";

async function main() {
  const lucid = await Lucid.new(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", BLOCKFROST_PROJECT_ID),
    "Preprod"
  );

  // Generate a private key
  const skey = await lucid.utils.generatePrivateKey();

  // Select this key (makes it the active wallet)
  lucid.selectWalletFromPrivateKey(skey);

  // Get the address
  const address = await lucid.wallet.address();
  console.log("New Wallet Address:", address);

  // (Optional) Save the private key somewhere secure  
  console.log("Private Key (skey):", JSON.stringify(skey));
}

main().catch(console.error);
