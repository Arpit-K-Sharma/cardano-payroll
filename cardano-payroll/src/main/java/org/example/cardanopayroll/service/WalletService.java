package org.example.cardanopayroll.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class WalletService {


    @Value("${BLOCKFROST_PROJECT_ID}")
    private String blockfrostApiKey;

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${BLOCKFROST_BASE_URL:https://cardano-preprod.blockfrost.io/api/v0}")
    private String blockfrostBaseUrl;

    private String getBaseUrl() {
        return blockfrostBaseUrl;
    }

    // Get balance of wallet
    public String getWalletBalance(String address) throws IOException {
        Request request = new Request.Builder()
                .url(getBaseUrl() + "/addresses/" + address)
                .addHeader("project_id", blockfrostApiKey)
                .build();

        Response response = client.newCall(request).execute();
        if (!response.isSuccessful()) {
            return "Error fetching balance: " + response.message();
        }

        JsonNode json = mapper.readTree(response.body().string());
        // Balance is in lovelace, 1 ADA = 1_000_000 lovelace
        JsonNode amounts = json.get("amount");
        long lovelace = 0;
        for (JsonNode amount : amounts) {
            if (amount.get("unit").asText().equals("lovelace")) {
                lovelace = amount.get("quantity").asLong();
            }
        }
        double ada = lovelace / 1_000_000.0;
        return "Balance: " + ada + " ADA";
    }

    // Get transactions of wallet
    public String getWalletTransactions(String address) throws IOException {
        Request request = new Request.Builder()
                .url(getBaseUrl() + "/addresses/" + address + "/transactions")
                .addHeader("project_id", blockfrostApiKey)
                .build();

        Response response = client.newCall(request).execute();
        if (!response.isSuccessful()) {
            return "Error fetching transactions: " + response.message();
        }

        JsonNode json = mapper.readTree(response.body().string());
        return json.toString(); // You can parse and format nicely if needed
    }
}
