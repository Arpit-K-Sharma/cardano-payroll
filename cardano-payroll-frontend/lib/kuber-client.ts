import { KuberApiProvider } from "kuber-client";
import * as CSL from "@emurgo/cardano-serialization-lib-asmjs";
import config from "./config";
import { toast } from "sonner";

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
    const kuber = new KuberApiProvider(config.kuberApiUrl , config.kuberApiKey || '');
    // Retrieve wallet info from session storage
    const session = sessionStorage.getItem('walletSession');
    if (!session) {
        toast.error('Wallet not connected. Please sign in with your wallet.');
        return;
    }
    const { walletName: walletId, address: walletAddress } = JSON.parse(session);
    // Log wallet session with full address

    // Get the wallet API from window.cardano
    if (!window.cardano) {
        toast.error('window.cardano is not available. Please ensure your wallet extension is installed.');
        return;
    }

    const walletApi = window.cardano[walletId];
    if (!walletApi) {
        toast.error(`Wallet extension '${walletId}' not found. Please ensure your wallet is installed and connected.`);
        return;
    }

    // Enable the wallet
    let cip30Api;
    try {
        cip30Api = await walletApi.enable();
        console.log("Wallet enabled, CIP30 API:", cip30Api);
    } catch (error) {
        toast.error('Failed to enable wallet: ' + (error as Error).message);
        throw error;
    }

    console.info("Using Browser Wallet", {
        name: walletId,
        address: walletAddress,
    });




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
        await fetch(config.apiBaseUrl + "/api/run-wallet-payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTxCbor }),
        });

    } catch (e) {
        const error = e as Error;
        throw e;
    }
}
