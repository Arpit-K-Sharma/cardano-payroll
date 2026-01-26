import { KuberApiProvider } from "kuber-client";
import * as CSL from "@emurgo/cardano-serialization-lib-asmjs";

// Helper to convert CIP-30 UTXOs to Kuber format
function convertCip30UtxosToKuber(utxos: string[]) {
    return utxos.map(cborHex => {
        const utxo = CSL.TransactionUnspentOutput.from_bytes(Buffer.from(cborHex, "hex"));
        const input = utxo.input();
        const txHash = Buffer.from(input.transaction_id().to_bytes()).toString("hex");
        const index = input.index();
        return {
            txin: `${txHash}#${index}`
        };
    });
}


export async function sendBatchAda(payments: { address: string, amount: number }[]) {
    // Log all payment addresses in full (no truncation)
    console.log("sendBatchAda called with payments:", payments.map(p => ({ address: p.address, amount: p.amount })));

    const kuber = new KuberApiProvider('https://preprod.kuber.cardanoapi.io', 'qkanfgYFXyekN50mpgMzFuTdpkLi1vzdQItdKDr4l4edyqMFv3vaS7X6rQy8E');
    // Retrieve wallet info from session storage
    const session = sessionStorage.getItem('walletSession');
    if (!session) {
        alert('Wallet not connected. Please sign in with your wallet.');
        return;
    }
    const { id: walletId, address: walletAddress } = JSON.parse(session);
    // Log wallet session with full address
    console.log("Wallet session:", { walletId, walletAddress });

    // Get the wallet API from window.cardano
    if (!window.cardano) {
        alert('window.cardano is not available. Please ensure your wallet extension is installed.');
        return;
    }

    const walletApi = window.cardano[walletId];
    if (!walletApi) {
        alert(`Wallet extension '${walletId}' not found. Please ensure your wallet is installed and connected.`);
        return;
    }
    console.log("Wallet API found:", walletApi);

    // Enable the wallet
    let cip30Api;
    try {
        cip30Api = await walletApi.enable();
        console.log("Wallet enabled, CIP30 API:", cip30Api);
    } catch (error) {
        alert('Failed to enable wallet: ' + (error as Error).message);
        throw error;
    }

    console.info("Using Browser Wallet", {
        name: walletId,
        address: walletAddress,
    });

    // Use the wallet address from session (already in Bech32 format)
    // Log change address in full
    console.log("Change address (full):", walletAddress);

    // Build transaction with multiple outputs
    // Log all output addresses in full
    console.log("Building transaction with outputs:", payments.map(p => ({ address: p.address, value: p.amount })));

    // Debug: Check wallet UTXOs before sending (CIP-30 standard way)
    let utxos: string[] = [];
    try {
        utxos = await cip30Api.getUtxos();
        console.log("Wallet UTXOs:", utxos);
    } catch (e) {
        console.warn("Could not fetch wallet UTXOs before sending.", e);
    }
    // Convert UTXOs to Kuber format
    const kuberInputs = convertCip30UtxosToKuber(utxos);


    const tx = await kuber.buildTx({
        inputs: kuberInputs,
        outputs: payments.map(p => ({
            address: p.address,
            value: p.amount
        })),
        changeAddress: walletAddress
    });
    console.log("Transaction built (CBOR):", tx);

    // Sign the transaction using the wallet
    try {
        const witnessSet = await cip30Api.signTx(tx.cborHex, true);
        console.log("Transaction signed, witness set:", witnessSet);

        // Combine the unsigned tx and witness set into a signed tx
        const unsignedTx = CSL.Transaction.from_bytes(Buffer.from(tx.cborHex, "hex"));
        const txBody = unsignedTx.body();
        const witness = CSL.TransactionWitnessSet.from_bytes(Buffer.from(witnessSet, "hex"));
        const signedTx = CSL.Transaction.new(
            txBody,
            witness,
            unsignedTx.auxiliary_data()
        );
        const signedTxCbor = Buffer.from(signedTx.to_bytes()).toString("hex");

        // Submit the signed transaction
        const txHash = await cip30Api.submitTx(signedTxCbor);
        console.log("TX_HASH=", txHash);
        return txHash;
    } catch (e) {
        const error = e as Error;
        alert((error && error.message) || String(e));
        throw e;
    }
}
