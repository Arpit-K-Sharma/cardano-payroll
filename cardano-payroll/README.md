# Cardano Payroll – Backend

Spring Boot service that manages employees, runs monthly payroll, and sends ADA through a Node/Lucid helper script wired to Blockfrost.

## Features

- CRUD endpoints for employees (`/api/createEmployee`, `/api/getAllEmployees`, etc.).
- `/api/run-payroll` batches every employee and records each `PayrollTransaction`.
- Wallet utilities to read balances/transactions from Blockfrost.
- Scheduler (`@Scheduled cron "0 0 10 1 * ?"`) that auto-runs payroll on the 1st of each month 10:00 server time.
- Transactions wait for on-chain confirmation before the next payment starts (prevents UTxO reuse).

## Prerequisites

- Java 17+ and Maven 3.9+
- PostgreSQL (default connection `jdbc:postgresql://localhost:5432/cardano_payroll`, user `postgres`, password `root` – adjust in `src/main/resources/application.properties`)
- Node.js 18+ (for the Lucid helper script)
- Blockfrost project on the preprod network (API key)
- Company wallet signing key compatible with Lucid (ed25519_sk…)

## Configuration

`src/main/resources/application.properties` controls the runtime configuration. Important entries:

```properties
# Wallet + Blockfrost
COMPANY_WALLET_ADDRESS=addr_test...
BLOCKFROST_PROJECT_ID=preprod...
BLOCKFROST_BASE_URL=https://cardano-preprod.blockfrost.io/api/v0
COMPANY_SKEY=ed25519_sk...
SCRIPT_PATH=C:/dev/Sireto/Haskell_learning/Internship_Assignment/scripts/send-ada.js
```

Things to verify:
- `SCRIPT_PATH` points to the maintained `scripts/send-ada.js` in this repo (relative paths are supported).
- The script directory contains `node_modules` after running `npm install` (see `scripts/package.json`). This is required because the Spring process launches `node send-ada.js ...` directly.
- Postgres credentials match your local DB.

## Running Locally

```bash
cd cardano-payroll
mvn spring-boot:run
```

The service starts on `http://localhost:8080` and exposes REST endpoints under `/api`. During payroll, the console logs will show:

```
Sending 2.0 ADA to <wallet>
NODE: COMPANY_ADDRESS=...
NODE: WAITING_FOR_CONFIRMATION=<txHash>
NODE: CONFIRMED=<txHash>
NODE: TX_HASH=<txHash>
Transaction successful! ...
```

If you don’t see the `WAITING_FOR_CONFIRMATION`/`CONFIRMED` lines, the wrong script path is configured.

## Useful Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/createEmployee` | POST | Create employee (body matches `Employee`). |
| `/api/getAllEmployees` | GET | List employees. |
| `/api/updateEmployee/{id}` | PATCH | Update employee fields (partial). |
| `/api/deleteEmployee/{id}` | DELETE | Remove employee + cascade delete payroll transactions. |
| `/api/run-payroll` | GET | Run payroll immediately (one by one, blocking between tx confirmations). |
| `/api/transactions` | GET | List all payroll transactions. |
| `/api/transactions/{employeeId}` | GET | Transactions for a single employee. |
| `/api/wallet/balance?address=...` | GET | Proxy to Blockfrost wallet balance. |
| `/api/wallet/transactions?address=...` | GET | Proxy to Blockfrost wallet transactions. |

## Scheduler Notes
- Cron expression `"0 0 10 1 * ?"` → 10:00 AM on the 1st day of every month (server local time).
- Logs `Starting monthly payroll...` when triggered.
- Manual trigger via `/api/run-payroll` uses the same code path, so it can be invoked any time (e.g., from the frontend “Run Payroll” button).

## Troubleshooting

- **Second employee always fails**: ensure backend has been restarted after updating `scripts/send-ada.js` and `application.properties`. The new script waits for confirmation, preventing `BadInputsUTxO` errors.
- **`Node script failed`**: confirm `SCRIPT_PATH` is correct, `npm install` has been run inside `scripts/`, and the signing key / Blockfrost key are valid.
- **`Transaction ... not confirmed in time`**: network congestion; increase the polling window in `CardanoTxUtil.awaitConfirmation` or re-run payroll after ensuring the transaction eventually lands.
- **Database errors on delete**: this code now deletes payroll transactions before employees (`EmployeeService.deleteEmployee`), but if you see constraint violations, verify there are no additional foreign keys referencing `employee`.

## Project Structure

- `controller/` – REST endpoints (employees, payroll, wallet, transactions)
- `service/PayrollService` – orchestrates payroll, interacts with `CardanoTxUtil`
- `utils/CardanoTxUtil` – wraps Node helper and waits for Blockfrost confirmation
- `scheduler/PayrollScheduler` – monthly cron trigger
- `scripts/` (repo root) – Node helper that actually mints/signs Cardano transactions

Feel free to extend the API (e.g., add a “manual send” endpoint) by reusing `CardanoTxUtil.sendADA`. Keep the confirmation wait in place to avoid UTxO reuse issues.

