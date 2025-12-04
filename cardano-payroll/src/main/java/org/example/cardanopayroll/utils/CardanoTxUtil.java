package org.example.cardanopayroll.utils;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.InputStreamReader;


@Component
public class CardanoTxUtil {

    @Value("${BLOCKFROST_PROJECT_ID}")
    private String blockfrostApiKey;

    @Value("${COMPANY_SKEY}")
    private String companySkey;

    @Value("${SCRIPT_SERVICE_URL}")
    private String scriptServiceUrl;

    @Value("${BLOCKFROST_BASE_URL:https://cardano-preprod.blockfrost.io/api/v0}")
    private String blockfrostBaseUrl;

    public String sendADA(String employeeWalletAddress, Double amountADA) throws Exception {
        // Call the external scripts service over HTTP instead of executing a local Node process
        String requestBody = String.format(
                "{\"apiKey\":\"%s\",\"privateKey\":\"%s\",\"toAddress\":\"%s\",\"amount\":%s}",
                escapeJson(blockfrostApiKey),
                escapeJson(companySkey),
                escapeJson(employeeWalletAddress),
                amountADA.toString()
        );

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(scriptServiceUrl + "/send-ada"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IllegalStateException("Script service error: " + response.body());
        }

        String body = response.body();
        String txHash = extractTxHashFromJson(body);

        if (txHash == null || txHash.isEmpty()) {
            throw new IllegalStateException("Transaction not submitted — no hash returned from script service");
        }

        awaitConfirmation(txHash);

        return txHash;
    }

    private void awaitConfirmation(String txHash) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        int attempts = 0;
        while (attempts < 15) { // roughly 60 seconds
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(String.format("%s/txs/%s", blockfrostBaseUrl, txHash)))
                    .header("project_id", blockfrostApiKey)
                    .GET()
                    .build();

            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() == 200) {
                return;
            }

            Thread.sleep(6000);
            attempts++;
        }

        throw new IllegalStateException("Transaction " + txHash + " was not confirmed in time");
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String extractTxHashFromJson(String json) {
        // Very small, dependency-free parser for { "txHash": "..." }
        String key = "\"txHash\"";
        int idx = json.indexOf(key);
        if (idx == -1) return null;
        int colon = json.indexOf(':', idx + key.length());
        if (colon == -1) return null;
        int firstQuote = json.indexOf('"', colon);
        if (firstQuote == -1) return null;
        int secondQuote = json.indexOf('"', firstQuote + 1);
        if (secondQuote == -1) return null;
        return json.substring(firstQuote + 1, secondQuote);
    }
}
