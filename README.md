# Cardano Payroll System

A comprehensive payroll management system for Cardano blockchain, consisting of a Spring Boot backend, Next.js frontend, and Node.js scripts for ADA transactions.

## Project Structure

### cardano-payroll/

The backend component built with Spring Boot. This is a REST API service that manages employees, processes monthly payroll, and integrates with Cardano blockchain for ADA payments.

**Key Features:**

- Employee CRUD operations
- Automated monthly payroll processing
- Integration with Blockfrost API for wallet management
- PostgreSQL database for data persistence
- Scheduled tasks for recurring payroll runs

**Technologies:**

- Java 17
- Spring Boot
- PostgreSQL
- OkHttp for API calls
- Maven for build management

### cardano-payroll-frontend/

The user interface built with Next.js. Provides a dashboard for managing employees, viewing payroll transactions, and monitoring wallet balances.

**Key Features:**

- Employee management interface
- Payroll dashboard with transaction history
- Wallet balance monitoring
- Responsive design with ShadCN UI components

**Technologies:**

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- ShadCN UI components

### scripts/

Node.js utilities for interacting with the Cardano blockchain. Contains scripts for sending ADA transactions using the Lucid library.

**Key Features:**

- ADA transaction processing
- Integration with Blockfrost API
- Retry logic for failed transactions
- Confirmation waiting for on-chain verification

**Technologies:**

- Node.js 18+
- Lucid Cardano library
- Blockfrost API


## Installation and Setup

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL
- Maven 3.9+
- Blockfrost project on Cardano preprod network

### Backend Setup

```bash
cd cardano-payroll
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`.

### Frontend Setup

```bash
cd cardano-payroll-frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`.

### Scripts Setup

```bash
cd scripts
npm install
```

## Usage

1. Start the backend service
2. Start the frontend application
3. Access the dashboard at `http://localhost:3000`
4. Configure wallet settings and employee data
5. Run payroll manually or wait for scheduled execution

## API Endpoints

The backend provides REST endpoints for:

- Employee management (`/api/employees`)
- Payroll processing (`/api/run-payroll`)
- Transaction history (`/api/transactions`)
- Wallet operations (`/api/wallet`)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
