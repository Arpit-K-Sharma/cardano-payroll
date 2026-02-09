# Cardano Payroll System

A comprehensive, blockchain-integrated payroll management system built for the Cardano ecosystem. This application automates employee compensation through ADA cryptocurrency transactions, providing a secure and transparent solution for modern payroll management.

![Cardano Payroll](https://img.shields.io/badge/Cardano-Payroll-blue?style=for-the-badge&logo=cardano)
![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=spring-boot)

## 🚀 Features

### Core Functionality

- **Employee Management**: Complete CRUD operations for employee data
- **Automated Payroll Processing**: Scheduled monthly payroll execution
- **Blockchain Integration**: Direct ADA transactions via Cardano network
- **Wallet-to-Wallet Payments**: Support for direct wallet payments using connected Cardano wallets
- **Multi-Network Support**: Run on Cardano mainnet, preprod, or preview networks
- **Real-time Dashboard**: Monitor transactions, balances, and payroll status
- **Transaction History**: Comprehensive audit trail of all payments
- **Wallet Management**: Company wallet integration with Blockfrost and Kuber API

### Technical Features

- **RESTful API**: Well-documented REST endpoints
- **Database Persistence**: PostgreSQL for reliable data storage
- **Health Monitoring**: Spring Boot Actuator for system health checks
- **Responsive UI**: Modern React interface with TypeScript
- **Containerized Deployment**: Docker Compose for easy setup
- **Environment Configuration**: Flexible environment-based settings

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│  (Spring Boot)  │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Blockchain    │
                       │   (Cardano)     │
                       │  via Blockfrost │
                       └─────────────────┘
```

## 📋 Prerequisites

Before installing the Cardano Payroll System, ensure you have the following installed:

### Development Environment

- **Java**: Version 17 or higher
- **Node.js**: Version 18 or higher
- **Maven**: Version 3.9 or higher
- **PostgreSQL**: Version 15 or higher
- **Git**: For version control

### Blockchain Requirements

- **Blockfrost Account**: [Sign up](https://blockfrost.io/) for a free account
- **Kuber API**: Access to Kuber Cardano API for wallet operations
- **Cardano Network**: Support for mainnet, preprod, or preview networks
- **Company Wallet**: A Cardano wallet with ADA for payroll operations
- **Browser Wallet Extension**: Lace, Eternl, Flint, Yoroi, Gero, or Typhon for wallet-based payments

### Optional Tools

- **Docker & Docker Compose**: For containerized deployment
- **Visual Studio Code**: Recommended IDE
- **Postman**: For API testing

## 🛠️ Installation

### Environment Configuration

The Cardano Payroll System uses `.env` files for configuration. The setup differs for local development vs Docker deployment.

#### For Local Development

You need **two separate .env files**:

1. **Root `.env`** (for backend):
   - Copy `.env.example` to `.env` in the project root
   - Configure backend and blockchain settings

2. **Frontend `.env`** (for frontend):
   - Copy `cardano-payroll-frontend/.env.example` to `cardano-payroll-frontend/.env`
   - Configure frontend API and Cardano network settings

```bash
# Copy root .env for backend
cp .env.example .env

# Copy frontend .env
cp cardano-payroll-frontend/.env.example cardano-payroll-frontend/.env

# Edit both files with your configuration
```

#### For Docker Deployment

You need **ONE combined .env file** in the project root:

- Copy `.env.example` to `.env` in the project root
- Add **ALL** environment variables from both backend and frontend configurations
- Docker Compose will use this single `.env` file for all services

```bash
# Copy and combine .env for Docker
cp .env.example .env

# Edit .env and add ALL variables from both examples:
# - Backend vars (BLOCKFROST_PROJECT_ID, COMPANY_SKEY, etc.)
# - Frontend vars (NEXT_PUBLIC_KUBER_API_KEY, NEXT_PUBLIC_CARDANO_NETWORK, etc.)
```

**Important**: For Docker, ensure your root `.env` contains:
- All backend variables (BLOCKFROST_PROJECT_ID, COMPANY_SKEY, etc.)
- All frontend NEXT_PUBLIC_* variables (NEXT_PUBLIC_KUBER_API_KEY, NEXT_PUBLIC_CARDANO_NETWORK, etc.)

### Method 1: Docker Compose (Recommended)

This is the fastest way to get the entire system running.

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd cardano-payroll
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory with **ALL** backend and frontend variables:

   ```bash
   # Database Configuration
   SPRING_DATASOURCE_PASSWORD=your_secure_password

   # Blockfrost Configuration
   BLOCKFROST_PROJECT_ID=your_blockfrost_project_id

   # Cardano Wallet Configuration
   COMPANY_WALLET_ADDRESS=your_company_wallet_address
   COMPANY_SKEY=your_company_wallet_spending_key

   # Kuber API Configuration
   KUBER_API_URL=https://preprod.kuber.cardanoapi.io
   KUBER_API_KEY=your_kuber_api_key

   # Script Paths (for Docker)
   BATCH_SCRIPT_PATH=/app/scripts/send-ada.js
   BATCH_WALLET_PATH=/app/scripts/send-wallet-ada.js

   # Frontend Configuration (NEXT_PUBLIC_* vars for Docker build)
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   NEXT_PUBLIC_KUBER_API_URL=https://preprod.kuber.cardanoapi.io
   NEXT_PUBLIC_KUBER_API_KEY=your_kuber_api_key
   NEXT_PUBLIC_COMPANY_WALLET_ADDRESS=your_company_wallet_address
   NEXT_PUBLIC_CARDANO_NETWORK=preprod
   ```

   **Note**: For Docker, all NEXT_PUBLIC_* variables must be in the root `.env` for build-time injection.

3. **Build and start the application**:

   ```bash
   # Build images from scratch (recommended for first run or after changes)
   docker compose build --no-cache
   
   # Start all services
   docker compose up -d
   ```

4. **Verify deployment**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Health Check: http://localhost:8080/actuator/health

### Method 2: Manual Installation

#### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd cardano-payroll
   ```

2. **Configure database**:
   Create a PostgreSQL database:

   ```sql
   CREATE DATABASE cardano_payroll;
   ```

3. **Set environment variables**:

   ```bash
   # Backend environment variables (root .env)
   export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/cardano_payroll
   export SPRING_DATASOURCE_USERNAME=postgres
   export SPRING_DATASOURCE_PASSWORD=your_password
   export BLOCKFROST_PROJECT_ID=your_project_id
   export COMPANY_WALLET_ADDRESS=your_wallet_address
   export COMPANY_SKEY=your_spending_key
   export KUBER_API_URL=https://preprod.kuber.cardanoapi.io
   export KUBER_API_KEY=your_kuber_api_key
   export BATCH_SCRIPT_PATH=./scripts/send-ada.js
   export BATCH_WALLET_PATH=./scripts/send-wallet-ada.js
   ```

4. **Run the backend**:
   ```bash
   mvn spring-boot:run
   ```

#### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd cardano-payroll-frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create frontend .env file**:
   
   ```bash
   # Create .env in cardano-payroll-frontend directory
   cd cardano-payroll-frontend
   cp .env.example .env
   
   # Edit .env with your configuration:
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   NEXT_PUBLIC_KUBER_API_URL=https://preprod.kuber.cardanoapi.io
   NEXT_PUBLIC_KUBER_API_KEY=your_kuber_api_key
   NEXT_PUBLIC_COMPANY_WALLET_ADDRESS=your_wallet_address
   NEXT_PUBLIC_CARDANO_NETWORK=preprod
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

#### Scripts Setup

1. **Navigate to scripts directory**:

   ```bash
   cd scripts
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## 🔧 Configuration

### Backend Configuration

The backend uses Spring Boot's external configuration. Key properties in `application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/cardano_payroll
spring.datasource.username=postgres
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:root}

# Blockfrost API Configuration
BLOCKFROST_PROJECT_ID=${BLOCKFROST_PROJECT_ID}
BLOCKFROST_BASE_URL=https://cardano-preprod.blockfrost.io/api/v0

# Company Wallet Configuration
COMPANY_WALLET_ADDRESS=${COMPANY_WALLET_ADDRESS}
COMPANY_SKEY=${COMPANY_SKEY}
```

### Frontend Configuration

The frontend connects to the backend and Cardano network via environment variables:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Kuber API Configuration
NEXT_PUBLIC_KUBER_API_URL=https://preprod.kuber.cardanoapi.io
NEXT_PUBLIC_KUBER_API_KEY=your_kuber_api_key

# Wallet Configuration
NEXT_PUBLIC_COMPANY_WALLET_ADDRESS=your_wallet_address

# Cardano Network: 'mainnet', 'preprod', or 'preview'
NEXT_PUBLIC_CARDANO_NETWORK=preprod
```

**Network Configuration**: The `NEXT_PUBLIC_CARDANO_NETWORK` variable determines which Cardano network the wallet connection uses. Change this to switch between mainnet, preprod (testnet), or preview networks.

### Blockfrost Setup

1. **Create Blockfrost Account**: Sign up at [blockfrost.io](https://blockfrost.io/)
2. **Create Project**: Choose Cardano preprod network
3. **Get API Key**: Copy your project ID for configuration
4. **Fund Wallet**: Use [Cardano Faucet](https://docs.cardano.org/cardano-testnet/faucet) for testnet ADA

## 📖 Usage Guide

### Getting Started

1. **Access the Application**: Open http://localhost:3000 in your browser
2. **Dashboard Overview**: View system status, recent transactions, and wallet balance
3. **Employee Management**: Add, edit, and manage employee information
4. **Wallet Monitoring**: Check company wallet balance and transaction history

### Employee Management

#### Adding Employees

1. Navigate to the Employees section
2. Click "Add Employee"
3. Fill in employee details:
   - Name
   - Email
   - Cardano Wallet Address
   - Monthly Salary (in ADA)
4. Save the employee

#### Editing Employees

1. Select an employee from the list
2. Click "Edit"
3. Update the necessary information
4. Save changes

### Payroll Processing

#### Manual Payroll Run (Company Wallet)

1. Go to the Payroll section
2. Click "Run Payroll"
3. Review the payroll summary
4. Confirm the transaction
5. Transaction is processed using the company wallet configured in backend

#### Wallet-to-Wallet Payment (New Feature)

The system now supports direct wallet payments using browser wallet extensions:

1. **Connect Your Wallet**:
   - Click "Connect Wallet" in the wallet section
   - Select your wallet (Lace, Eternl, Flint, Yoroi, Gero, or Typhon)
   - Approve the connection request

2. **Send Payment**:
   - Navigate to the Payroll section
   - Select employees to pay
   - Click "Pay with Wallet"
   - Review the transaction in your wallet extension
   - Approve the transaction

3. **Supported Wallets**:
   - Lace
   - Eternl
   - Flint
   - Yoroi
   - Gero Wallet
   - Typhon

**Benefits**:
- Direct control over payments
- Hardware wallet support via browser extensions
- Real-time transaction signing
- Multi-signature support (depending on wallet)

#### Automated Payroll

- The system automatically runs payroll on the 1st of each month
- Configure custom schedules in the backend scheduler

### Transaction Monitoring

1. **View Transactions**: Access the transaction history from the dashboard
2. **Check Status**: Monitor transaction confirmation status
3. **Transaction Details**: View individual transaction details and blockchain confirmations

## 🔌 API Documentation

### Authentication

Currently, the API does not require authentication for development. Implement authentication for production use.

### Base URL

```
Development: http://localhost:8080/api
```

### Endpoints

#### Employee Management

```http
GET    /api/employees           # Get all employees
POST   /api/employees           # Create new employee
GET    /api/employees/{id}      # Get employee by ID
PUT    /api/employees/{id}      # Update employee
DELETE /api/employees/{id}      # Delete employee
```

#### Payroll Operations

```http
POST   /api/run-payroll         # Trigger payroll processing
GET    /api/transactions        # Get transaction history
GET    /api/transactions/{id}   # Get transaction details
```

#### Wallet Operations

```http
GET    /api/wallet/balance      # Get company wallet balance
GET    /api/wallet/history      # Get wallet transaction history
POST   /api/wallet/send         # Send ADA from connected wallet (new)
```

#### Network Configuration

The application supports multiple Cardano networks:
- **Mainnet**: Production Cardano network
- **Preprod**: Primary testnet for development
- **Preview**: Alternative testnet for testing

Configure the network using `NEXT_PUBLIC_CARDANO_NETWORK` in your frontend `.env` file.

#### Health Check

```http
GET    /actuator/health         # System health status
```

### Example API Usage

#### Create Employee

```bash
curl -X POST http://localhost:8080/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "cardanoWalletAddress": "addr1...",
    "monthlySalary": 1000
  }'
```

#### Run Payroll

```bash
curl -X POST http://localhost:8080/api/run-payroll
```

## 🔒 Security Considerations

### Development Environment

- **Private Keys**: Never commit spending keys to version control
- **Environment Variables**: Use environment variables for sensitive data
- **Database**: Use strong passwords and restrict access

### Production Deployment

- **Authentication**: Implement JWT or OAuth2 authentication
- **HTTPS**: Use SSL certificates for secure communication
- **Network Security**: Configure firewalls and VPN access
- **Key Management**: Use secure key management systems
- **Audit Logging**: Implement comprehensive audit trails

### Blockchain Security

- **Wallet Security**: Keep private keys secure and use hardware wallets when possible
- **Testnet First**: Always test on Cardano testnet before mainnet deployment
- **Transaction Validation**: Validate all transactions before processing

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed

```
Error: Connection to database refused
```

**Solution**: Ensure PostgreSQL is running and credentials are correct

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL if stopped
sudo systemctl start postgresql
```

#### Blockfrost API Errors

```
Error: Invalid project ID or network
```

**Solution**: Verify your Blockfrost project ID and network configuration

- Ensure you're using the correct project ID
- Verify you're connected to the Cardano preprod network

#### Frontend Cannot Connect to Backend

```
Error: Failed to fetch
```

**Solution**: Check backend service status, CORS configuration, and environment variables

```bash
# Verify backend is running
curl http://localhost:8080/actuator/health

# Check frontend environment variables (local development)
cat cardano-payroll-frontend/.env

# For Docker, check root .env contains NEXT_PUBLIC_* variables
cat .env | grep NEXT_PUBLIC
```

#### Wallet Connection Issues

```
Error: Wallet not found or connection refused
```

**Solution**: 
- Ensure you have a supported Cardano wallet extension installed
- Refresh the page after installing the wallet
- Check that the wallet is on the correct network (preprod/mainnet/preview)
- Verify `NEXT_PUBLIC_CARDANO_NETWORK` matches your wallet's network

#### Missing Environment Variables in Docker

```
Warning: The "NEXT_PUBLIC_KUBER_API_KEY" variable is not set
```

**Solution**: For Docker deployment, ensure ALL NEXT_PUBLIC_* variables are in the **root** `.env` file, not just the frontend `.env`:

```bash
# Root .env must contain:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KUBER_API_URL=https://preprod.kuber.cardanoapi.io
NEXT_PUBLIC_KUBER_API_KEY=your_key
NEXT_PUBLIC_COMPANY_WALLET_ADDRESS=your_address
NEXT_PUBLIC_CARDANO_NETWORK=preprod
```

Then rebuild:
```bash
docker compose build --no-cache
docker compose up -d
```

#### Insufficient ADA Balance

```
Error: Insufficient funds for transaction
```

**Solution**: Fund your company wallet with testnet ADA

- Visit Cardano Faucet for testnet ADA
- Check wallet balance in the dashboard

#### Docker Container Issues

```
Error: Container failed to start
```

**Solution**: Check Docker logs and configuration

```bash
# View container logs
docker-compose logs backend
docker-compose logs frontend

# Restart containers
docker-compose restart
```

### Performance Optimization

#### Database Performance

- Enable connection pooling in production
- Add database indexes for frequently queried fields
- Monitor query performance with Spring Boot Actuator

#### API Response Times

- Implement caching for wallet balance queries
- Use pagination for large datasets
- Optimize blockchain API calls with caching

## 🧪 Testing

### Backend Testing

```bash
cd cardano-payroll
mvn test
```

### Frontend Testing

```bash
cd cardano-payroll-frontend
npm test
```

### Integration Testing

Run full system tests with Docker Compose:

```bash
docker-compose -f docker-compose.test.yml up
```

## 📦 Deployment

### Docker Deployment

1. **Build images**:

   ```bash
   docker-compose build
   ```

2. **Deploy to production**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cloud Deployment Options

- **AWS**: Use ECS or EKS for container orchestration
- **Google Cloud**: Deploy with Cloud Run or GKE
- **Azure**: Use Container Instances or AKS
- **DigitalOcean**: Use App Platform or Kubernetes

### Environment Variables for Production

```bash
# Production Environment Variables (Root .env for Docker)
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db:5432/cardano_payroll
SPRING_DATASOURCE_PASSWORD=secure_production_password
BLOCKFROST_PROJECT_ID=mainnet_blockfrost_project
COMPANY_WALLET_ADDRESS=prod_wallet_address
COMPANY_SKEY=prod_spending_key_encrypted
KUBER_API_URL=https://mainnet.kuber.cardanoapi.io
KUBER_API_KEY=prod_kuber_api_key
BATCH_SCRIPT_PATH=/app/scripts/send-ada.js
BATCH_WALLET_PATH=/app/scripts/send-wallet-ada.js

# Frontend Production Variables
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_KUBER_API_URL=https://mainnet.kuber.cardanoapi.io
NEXT_PUBLIC_KUBER_API_KEY=prod_kuber_api_key
NEXT_PUBLIC_COMPANY_WALLET_ADDRESS=prod_wallet_address
NEXT_PUBLIC_CARDANO_NETWORK=mainnet
```

**Important**: For production mainnet deployment:
- Change `NEXT_PUBLIC_CARDANO_NETWORK` to `mainnet`
- Use mainnet Kuber and Blockfrost endpoints
- Secure all private keys and API keys
- Use HTTPS for all communications

## 🤝 Contributing

We welcome contributions to the Cardano Payroll System! Please follow these guidelines:

### Development Workflow

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
3. **Make Changes**: Follow coding standards and add tests
4. **Test Changes**: Ensure all tests pass
5. **Submit Pull Request**: Provide clear description of changes

### Code Standards

- **Backend**: Follow Spring Boot best practices and Java coding standards
- **Frontend**: Use TypeScript, follow React hooks patterns
- **Documentation**: Update documentation for new features
- **Testing**: Write unit and integration tests

### Commit Guidelines

- Use conventional commit messages
- Include issue numbers in commit messages
- Write clear, descriptive commit descriptions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Community**: Join our developer community discussions

### Professional Support

For enterprise support, custom development, or consulting services, please contact our team.

## 🙏 Acknowledgments

- **Cardano Foundation**: For the robust blockchain infrastructure
- **Blockfrost**: For reliable API services
- **Kuber API**: For simplified Cardano transaction building
- **Spring Boot Team**: For the excellent framework
- **React & Next.js Team**: For powerful UI libraries
- **Cardano Wallet Developers**: For CIP-30 wallet integration standards
- **Open Source Community**: For the countless libraries and tools

---

**Built with ❤️ for the Cardano ecosystem**
