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

    @Value("${SCRIPT_PATH}")
    private String scriptPath;

    @Value("${BLOCKFROST_BASE_URL:https://cardano-preprod.blockfrost.io/api/v0}")
    private String blockfrostBaseUrl;

    public String sendADA(String employeeWalletAddress, Double amountADA) throws Exception {
        File scriptFile = resolveScriptFile();

        ProcessBuilder pb = new ProcessBuilder(
                "node",
                scriptFile.getAbsolutePath(),
                blockfrostApiKey,
                companySkey,
                employeeWalletAddress,
                amountADA.toString()
        );

        // Ensure Node resolves dependencies relative to the script directory
        pb.directory(scriptFile.getParentFile());

        pb.redirectErrorStream(true);
        Process process = pb.start();

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

        if (exitCode != 0)
            throw new Exception("Node script failed");

        if (txHash == null)
            throw new Exception("Transaction not submitted — no hash returned");

        awaitConfirmation(txHash);

        return txHash;
    }

    private File resolveScriptFile() throws Exception {
        Path path = Paths.get(scriptPath);
        if (!path.isAbsolute()) {
            path = Paths.get("").toAbsolutePath().resolve(path).normalize();
        }

        if (!Files.exists(path)) {
            throw new IllegalStateException("send-ada script not found at " + path);
        }

        return path.toFile();
    }

    private void awaitConfirmation(String txHash) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        int attempts = 0;
        while (attempts < 12) { // roughly 60 seconds
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(String.format("%s/txs/%s", blockfrostBaseUrl, txHash)))
                    .header("project_id", blockfrostApiKey)
                    .GET()
                    .build();

            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() == 200) {
                return;
            }

            Thread.sleep(5000);
            attempts++;
        }

        throw new IllegalStateException("Transaction " + txHash + " was not confirmed in time");
    }
}
