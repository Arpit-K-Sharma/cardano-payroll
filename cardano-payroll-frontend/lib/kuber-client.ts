import { KuberApiProvider } from "kuber-client";
import * as CSL from "@emurgo/cardano-serialization-lib-asmjs";
import config, { getKuberApiUrl } from "./config";
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
    // Retrieve wallet info from session storage
    const session = sessionStorage.getItem('walletSession');
    if (!session) {
        toast.error('Wallet not connected. Please sign in with your wallet.');
        return;
    }

    const parsed = JSON.parse(session);
    // Support both key names: 'walletName' (from wallet-connect) and 'id' (legacy)
    const walletId: string = parsed.walletName ?? parsed.id;
    const walletAddress: string = parsed.address;

    if (!walletId) {
        toast.error('Wallet session is corrupted — missing wallet ID. Please disconnect and reconnect your wallet.');
        return;
    }
    if (!walletAddress) {
        toast.error('Wallet session is corrupted — missing address. Please disconnect and reconnect your wallet.');
        return;
    }

    // Derive Kuber API URL from the connected wallet address (mainnet vs testnet)
    const kuberApiUrl = getKuberApiUrl(walletAddress);
    const network = walletAddress.startsWith('addr1')
        ? 'mainnet'
        : (sessionStorage.getItem('cardanoTestnet') ?? 'preprod');
    console.info(`Sending batch payment on [${network}] via ${kuberApiUrl}`);
    const kuber = new KuberApiProvider(kuberApiUrl, config.kuberApiKey || '');

    // Get the wallet API from window.cardano
    if (!window.cardano) {
        toast.error('window.cardano is not available. Please ensure your Cardano wallet extension is installed and the page is loaded over HTTPS.');
        return;
    }

    const walletApi = window.cardano[walletId];
    if (!walletApi) {
        toast.error(`Wallet "${walletId}" not found in window.cardano. Please ensure the extension is installed and try reconnecting.`);
        return;
    }

    // Enable the wallet
    let cip30Api;
    try {
        cip30Api = await walletApi.enable();
    } catch (error) {
        toast.error(`Failed to enable "${walletId}" wallet: ${(error as Error).message}`);
        throw error;
    }

    // Fetch UTXOs
    let utxos: string[] = [];
    try {
        utxos = await cip30Api.getUtxos();
    } catch (e) {
        console.warn('Could not fetch wallet UTXOs before sending.', e);
    }

    if (!utxos || utxos.length === 0) {
        toast.error(`No UTXOs found in your wallet on ${network}. Make sure your wallet is funded on the correct network (${network}).`);
        return;
    }

    const kuberInputs = convertCip30UtxosToKuber(utxos);

    // Build transaction
    let tx: any;
    try {
        tx = await kuber.buildTx({
            inputs: kuberInputs,
            outputs: payments.map(p => ({
                address: p.address,
                value: p.amount
            })),
            changeAddress: walletAddress
        });
        console.log('Transaction built (CBOR):', tx);
    } catch (e: any) {
        const detail = e?.response?.data?.message ?? e?.message ?? String(e);
        toast.error(`Failed to build transaction on ${network} (${kuberApiUrl}): ${detail}`);
        throw e;
    }

    // Sign the transaction
    let witnessSet: string;
    try {
        witnessSet = await cip30Api.signTx(tx.cborHex, true);
        console.log('Transaction signed.');
    } catch (e: any) {
        const detail = e?.message ?? String(e);
        toast.error(`Transaction signing was rejected or failed: ${detail}`);
        throw e;
    }

    // Assemble signed tx
    const unsignedTx = CSL.Transaction.from_bytes(Buffer.from(tx.cborHex, 'hex'));
    const witness = CSL.TransactionWitnessSet.from_bytes(Buffer.from(witnessSet, 'hex'));
    const signedTx = CSL.Transaction.new(unsignedTx.body(), witness, unsignedTx.auxiliary_data());
    const signedTxCbor = Buffer.from(signedTx.to_bytes()).toString('hex');

    // Submit
    try {
        const res = await fetch(config.apiBaseUrl + '/api/run-wallet-payroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signedTxCbor }),
        });
        if (!res.ok) {
            const body = await res.text();
            toast.error(`Transaction submission failed (HTTP ${res.status}): ${body}`);
            throw new Error(`Submission error ${res.status}: ${body}`);
        }
        console.log('Transaction submitted successfully.');
    } catch (e: any) {
        if (!e.message?.startsWith('Submission error')) {
            toast.error(`Network error while submitting transaction: ${e.message}`);
        }
        throw e;
    }
}
