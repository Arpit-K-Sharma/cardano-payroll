# Cardano Payroll Project

This is a full-stack application for managing employee payroll on the Cardano blockchain. It includes a Spring Boot backend for handling business logic, API endpoints, and payroll processing; a Next.js frontend for the user dashboard; and Node.js scripts for executing Cardano transactions.

## Overview

- **Backend (cardano-payroll/)**: Manages employees, processes payroll, records transactions, and integrates with Cardano via Blockfrost and Lucid.
- **Frontend (cardano-payroll-frontend/)**: Provides a web interface for managing employees, running payroll, viewing transactions, and checking wallet balances.
- **Scripts (scripts/)**: Node.js utilities for sending ADA to employee wallets during payroll.

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL (with a database named `cardano_payroll`, user `postgres`, password `root` – adjust as needed)
- Blockfrost project on Cardano preprod network (API key required)
- Company wallet signing key (ed25519_sk… format)

## Installation

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd cardano_payroll
   ```

2. **Set up the backend**:

   - Navigate to `cardano-payroll/`:
     ```bash
     cd cardano-payroll
     ```
   - Ensure PostgreSQL is running and the database is created.
   - Edit `src/main/resources/application.properties` to configure:
     - Database connection (e.g., `spring.datasource.url=jdbc:postgresql://localhost:5432/cardano_payroll`)
     - Blockfrost API key: `BLOCKFROST_PROJECT_ID=your-preprod-api-key`
     - Company wallet address and signing key: `COMPANY_WALLET_ADDRESS=addr_test1...`, `COMPANY_SKEY=ed25519_sk...`
     - Script path: `SCRIPT_PATH=C:/dev/Sireto/Haskell_learning/cardano_payroll/scripts/send-ada.js` (adjust to your absolute path)
   - Install dependencies and run:
     ```bash
     mvn spring-boot:run
     ```
     The backend will start on `http://localhost:8080`.

3. **Set up the scripts**:

   - Navigate to `scripts/`:
     ```bash
     cd ../scripts
     npm install
     ```
     This installs `lucid-cardano` for Cardano interactions.

4. **Set up the frontend**:
   - Navigate to `cardano-payroll-frontend/`:
     ```bash
     cd ../cardano-payroll-frontend
     npm install
     npm run dev
     ```
     The frontend will start on `http://localhost:3000`.

## User Guide

1. **Access the Application**:

   - Open your browser and go to `http://localhost:3000` (frontend).
   - The backend runs on `http://localhost:8080` and serves APIs to the frontend.

2. **Using the Dashboard**:

   - **Employees Page**: Add, edit, or delete employees. Each employee needs a name, wallet address, and salary in ADA.
   - **Payroll Page**: Click "Run Payroll Now" to process payments for all employees. View transaction history in the table. Links to CardanoScan for on-chain verification.
   - **Wallet Page**: Check balances and transactions for any Cardano address (defaults to company wallet).
   - **Dashboard**: Overview of employee count, payroll stats, wallet balance, and recent activity.

3. **Automated Payroll**:

   - Payroll runs automatically on the 1st of each month at 10:00 AM server time via a scheduler.
   - Manual runs are available anytime via the Payroll page.

4. **API Endpoints** (for direct access or integration):
   - `GET /api/getAllEmployees` – List employees
   - `POST /api/createEmployee` – Add employee
   - `GET /api/run-payroll` – Trigger payroll
   - `GET /api/transactions` – View all transactions
   - `GET /api/wallet/balance?address=...` – Check balance
   - Full list in `cardano-payroll/README.md`

## Troubleshooting

- Ensure all prerequisites are installed and configured.
- Check console logs for errors (e.g., script path issues, Blockfrost key validity).
- For transaction failures, verify wallet keys and network congestion.
- If frontend can't connect to backend, confirm ports and CORS settings.

For detailed backend setup, see `cardano-payroll/README.md`. For frontend details, see `cardano-payroll-frontend/README.md`.
