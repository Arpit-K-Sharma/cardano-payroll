import { KuberApiProvider } from "kuber-client";


export async function sendBatchAda(payments: { address: string, amount: number }[]) {
    console.log("sendBatchAda called with payments:", payments);

    const kuber = new KuberApiProvider('http://172.31.1.31:8081');

    // Retrieve wallet info from session storage
    const session = sessionStorage.getItem('walletSession');
    if (!session) {
        alert('Wallet not connected. Please sign in with your wallet.');
        return;
    }
    const { id: walletId, address: walletAddress } = JSON.parse(session);
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
    console.log("Change address:", walletAddress);

    // Build transaction with multiple outputs
    console.log("Building transaction with outputs:", payments.map(p => ({
        address: p.address,
        value: p.amount
    })));

    const tx = await kuber.buildTx({
        outputs: payments.map(p => ({
            address: p.address,
            value: p.amount
        })),
        changeAddress: walletAddress
    });
    console.log("Transaction built (CBOR):", tx);

    // Sign the transaction using the wallet
    try {
        const witnessSet = await cip30Api.signTx(tx, true);
        console.log("Transaction signed, witness set:", witnessSet);

        // Submit the signed transaction
        const txHash = await cip30Api.submitTx(tx);
        console.log("TX_HASH=", txHash);
        return txHash;
    } catch (e) {
        const error = e as Error;
        alert((error && error.message) || String(e));
        throw e;
    }
}
