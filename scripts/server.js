import http from "http";
import { spawn } from "child_process";

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/send-ada") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                const { apiKey, privateKey, toAddress, amount } = JSON.parse(body || "{}");

                if (!apiKey || !privateKey || !toAddress || !amount) {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "Missing required fields" }));
                    return;
                }

                const child = spawn("node", ["send-ada.js", apiKey, privateKey, toAddress, String(amount)], {
                    cwd: process.cwd(),
                });

                let txHash = null;
                let stderr = "";

                child.stdout.on("data", (data) => {
                    const text = data.toString();
                    console.log(text.trim());
                    const lines = text.split("\n");
                    for (const line of lines) {
                        if (line.startsWith("TX_HASH=")) {
                            txHash = line.replace("TX_HASH=", "").trim();
                        }
                    }
                });

                child.stderr.on("data", (data) => {
                    stderr += data.toString();
                });

                child.on("close", (code) => {
                    if (code !== 0 || !txHash) {
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify({ error: "Script failed", details: stderr || "No TX_HASH returned" }));
                        return;
                    }

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ txHash }));
                });
            } catch (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Invalid request", details: err.message }));
            }
        });
    } else {
        res.statusCode = 404;
        res.end("Not found");
    }
});

server.listen(PORT, () => {
    console.log(`Scripts service listening on port ${PORT}`);
});


