# Cardano Payroll – Frontend

Next.js dashboard for managing employees, processing Cardano payroll, tracking wallet balances, and viewing transaction history.

## Features

- **Dashboard** shows counts for employees, payroll stats, wallet balance (company wallet), recent activity, and quick stats.
- **Employees** page provides full CRUD with inline table actions.
- **Payroll** page allows manual payroll runs (calls `/api/run-payroll`), shows scheduler info, and lists every `PayrollTransaction` with live refresh and links to CardanoScan.
- **Wallet** page reads balance/transactions for any Cardano address (pre-filled with the company wallet).
- Shared sidebar navigation, ShadCN UI components, and simple responsive layout.

## Prerequisites

- Node.js 18+
- Backend (`cardano-payroll`) running on `http://localhost:8080`
- ShadCN/Next dependencies installed (`npm install`)

## Running Locally

```bash
cd cardano-payroll-frontend
npm install
npm run dev
```

Visit `http://localhost:3000`. The layout is a single-page shell with a sidebar; navigation state is kept client-side via React state.

## API Expectations

All fetches hit `http://localhost:8080`:

- `GET /api/getAllEmployees`, `POST /api/createEmployee`, `PATCH /api/updateEmployee/{id}`, `DELETE /api/deleteEmployee/{id}`
- `GET /api/run-payroll` – manual payroll trigger
- `GET /api/transactions` – payment history (displayed in the payroll table)
- `GET /api/wallet/balance?address=...`, `GET /api/wallet/transactions?address=...`

If you change the backend host/port, update the hardcoded URLs or load them from environment variables (Next.js allows `process.env.NEXT_PUBLIC_API_BASE_URL`). Right now, calls are plain `fetch` statements in each page component.

## Pages Overview

| Component | Purpose |
| --- | --- |
| `components/pages/dashboard-page.tsx` | Aggregates employees, transactions, and wallet balance; renders cards and recent activity. |
| `components/pages/employees-page.tsx` | Lists employees, shows ShadCN table, and wraps `EmployeeForm` for create/update. |
| `components/pages/payroll-page.tsx` | Manual run panel (`/api/run-payroll`), scheduler info, summary cards, and `PaymentTable`. |
| `components/pages/wallet-page.tsx` | Input + results for wallet balance/transactions (defaults to company wallet). |
| `components/tables/payment-table.tsx` | Tabular view of `PayrollTransaction`, status icons, CardanoScan links. |
| `components/forms/employee-form.tsx` | Form used for create/edit flows. |
| `components/sidebar.tsx` | Static navigation entries (Dashboard, Employees, Payroll, Wallet). |

## Manual Payroll Flow

1. Click **Run Payroll Now** on the Payroll page; it calls `/api/run-payroll` (GET).
2. Backend processes employees sequentially, waiting for each Cardano transaction to confirm before continuing.
3. Once done, the frontend refreshes `/api/transactions` so the payment table reflects new entries.
4. Each transaction row links to CardanoScan (`https://preprod.cardanoscan.io/transaction/{txHash}`) for quick verification.

## Wallet Page

- Company wallet address (`addr_test1vpyjcw5...`) pre-filled via constant `COMPANY_WALLET_ADDRESS`.
- Users can overwrite the address and fetch balance/history for any address.
- Balance parsing handles responses like `"Balance: X ADA"`; if the backend returns an error string, it displays as-is.

## Styling & Components

- Uses the ShadCN UI kit (Button, Card, Input) and icons from `lucide-react`.
- Global styles live in `app/globals.css`; Tailwind is configured via `postcss.config.mjs` + `tailwind.config` (inlined via `globals.css`).

## Production Considerations

- Consider moving API base URLs into `.env` (`NEXT_PUBLIC_API_BASE_URL`).
- Add authentication before exposing payroll operations publicly.
- Handle backend errors more robustly (e.g., toast notifications, retry options).
- Some stats on the dashboard currently rely on basic calculations; consider caching or pagination for large datasets.

## Directory Layout

```
cardano-payroll-frontend/
├── app/                 # Next.js app directory
├── components/
│   ├── forms/           # Employee + payroll forms
│   ├── pages/           # Page-level containers used in the SPA shell
│   ├── tables/          # Reusable tables (EmployeeTable, PaymentTable)
│   ├── ui/              # ShadCN primitives
├── lib/                 # Shared types & utils
├── public/              # Static assets
└── README.md            # You are here
```

Feel free to extend the UI (e.g., add a manual ADA send form once the backend endpoint is available, or a transaction filter by employee). The current setup assumes the backend implements all business logic and security checks; the frontend stays lightweight and purely consumes the REST APIs.***
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
