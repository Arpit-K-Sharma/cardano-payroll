package org.example.cardanopayroll.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class CardanoTxUtil {

    @Value("${BLOCKFROST_PROJECT_ID}")
    private String blockfrostApiKey;

    @Value("${COMPANY_SKEY}")
    private String companySkey;

    @Value("${BATCH_SCRIPT_PATH}")
    private String batchScriptPath;

    @Value("${BLOCKFROST_BASE_URL:https://cardano-preprod.blockfrost.io/api/v0}")
    private String blockfrostBaseUrl;


    /**
     * Send ADA to multiple addresses in a single transaction
     * @param paymentData Format: "address1,amount1;address2,amount2;address3,amount3"
     * @return Transaction hash
     */
    public String sendBatchADA(String paymentData) throws Exception {
        File scriptFile = resolveScriptFile(batchScriptPath);

        ProcessBuilder pb = new ProcessBuilder(
                "node",
                scriptFile.getAbsolutePath(),
                blockfrostApiKey,
                companySkey,
                paymentData
        );

        pb.directory(scriptFile.getParentFile());
        pb.redirectErrorStream(true);
        Process process = pb.start();

        String txHash = processNodeOutput(process);

        awaitConfirmation(txHash);

        return txHash;
    }

    /**
     * Process Node.js script output and extract transaction hash
     */
    private String processNodeOutput(Process process) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        String txHash = null;

        while ((line = reader.readLine()) != null) {
            System.out.println("NODE: " + line);

            if (line.startsWith("TX_HASH=")) {
                txHash = line.replace("TX_HASH=", "").trim();
            }
        }

        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new Exception("Node script failed with exit code " + exitCode);
        }

        if (txHash == null) {
            throw new Exception("Transaction not submitted — no hash returned");
        }

        return txHash;
    }

    /**
     * Resolve script file path (supports both absolute and relative paths)
     */
    private File resolveScriptFile(String scriptPathStr) throws Exception {
        Path path = Paths.get(scriptPathStr);
        if (!path.isAbsolute()) {
            path = Paths.get("").toAbsolutePath().resolve(path).normalize();
        }

        if (!Files.exists(path)) {
            throw new IllegalStateException("Script not found at " + path);
        }

        return path.toFile();
    }

    /**
     * Wait for transaction confirmation on the blockchain
     */
    private void awaitConfirmation(String txHash) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        int attempts = 0;
        int maxAttempts = 12; // roughly 60 seconds

        while (attempts < maxAttempts) {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(String.format("%s/txs/%s", blockfrostBaseUrl, txHash)))
                    .header("project_id", blockfrostApiKey)
                    .GET()
                    .build();

            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());

            if (response.statusCode() == 200) {
                System.out.println("Transaction " + txHash + " confirmed!");
                return;
            }

            System.out.println("Waiting for confirmation... attempt " + (attempts + 1) + "/" + maxAttempts);
            Thread.sleep(5000);
            attempts++;
        }

        throw new IllegalStateException("Transaction " + txHash + " was not confirmed in time");
    }
}