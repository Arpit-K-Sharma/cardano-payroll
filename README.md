## Cardano Payroll – Full Stack (Dockerized)

This repository contains a full-stack Cardano payroll demo:

- **Backend**: Spring Boot app in `cardano-payroll`
- **Frontend**: Next.js app in `cardano-payroll-frontend`
- **Scripts**: Node.js Cardano helper scripts in `scripts`

The backend and frontend are dockerized and can be run together via `docker-compose`.

---

## Prerequisites

- **Docker** and **Docker Compose**
  - On Windows, Docker Desktop is recommended.
- (Optional) **Git** if you want to push this project to GitHub.

---

## Running everything with Docker

From the project root (`cardano_payroll`), build and start the stack:

```bash
docker compose up --build
```

This will:

- Build and run the **backend** Spring Boot service on port **8080**
- Build and run the **frontend** Next.js app on port **3000**

Then open:

- **Frontend UI**: `http://localhost:3000`
- **Backend API** (e.g. health or root): `http://localhost:8080`

To stop the stack:

```bash
docker compose down
```

### Notes on networking

- Inside Docker, the frontend reaches the backend via the service name:
  - `http://backend:8080`
- The `docker-compose.yml` already sets:
  - `NEXT_PUBLIC_API_BASE_URL=http://backend:8080`

If your frontend uses a different environment variable or a hard‑coded API URL, adjust it to use `NEXT_PUBLIC_API_BASE_URL` or update the compose file accordingly.

---

## Running services individually (optional)

You can also build and run each part separately if needed.

### Backend (Spring Boot)

From `cardano-payroll`:

```bash
./mvnw spring-boot:run
```

or with Docker only for the backend:

```bash
docker build -t cardano-payroll-backend ./cardano-payroll
docker run --rm -p 8080:8080 cardano-payroll-backend
```

### Frontend (Next.js)

From `cardano-payroll-frontend`:

```bash
npm install
npm run dev
```

or with Docker only for the frontend:

```bash
docker build -t cardano-payroll-frontend ./cardano-payroll-frontend
docker run --rm -p 3000:3000 cardano-payroll-frontend
```

---

## Using the `scripts` folder

The `scripts` directory contains Node.js helpers for Cardano operations (e.g. `create-wallet.js`, `send-ada.js`).

From `scripts`:

```bash
npm install
node create-wallet.js
```

These scripts are not wired into Docker right now; run them locally as needed, or you can add a separate service to `docker-compose.yml` if you’d like them containerized too.

---

## Pushing to GitHub

If you haven’t already created a Git repository:

```bash
git init
git add .
git commit -m "Initial commit: Dockerized Cardano payroll full stack"
```

Then on GitHub:

1. Create a **new empty repository** (no README/license/gitignore).
2. Follow the “push an existing repository from the command line” instructions they give you, which will look like:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

After that, your full dockerized project will be available on GitHub.


