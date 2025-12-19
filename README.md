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
- **Real-time Dashboard**: Monitor transactions, balances, and payroll status
- **Transaction History**: Comprehensive audit trail of all payments
- **Wallet Management**: Company wallet integration with Blockfrost API

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
- **Cardano Preprod Network**: Access to Cardano testnet for development
- **Company Wallet**: A Cardano wallet with ADA for payroll operations

### Optional Tools

- **Docker & Docker Compose**: For containerized deployment
- **Visual Studio Code**: Recommended IDE
- **Postman**: For API testing

## 🛠️ Installation

### Method 1: Docker Compose (Recommended)

This is the fastest way to get the entire system running.

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd cardano-payroll
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:

   ```bash
   # Database Configuration
   POSTGRES_PASSWORD=your_secure_password

   # Blockfrost Configuration
   BLOCKFROST_PROJECT_ID=your_blockfrost_project_id

   # Cardano Wallet Configuration
   COMPANY_WALLET_ADDRESS=your_company_wallet_address
   COMPANY_SKEY=your_company_wallet_spending_key

   # Spring Configuration
   SPRING_DATASOURCE_PASSWORD=your_secure_password
   ```

3. **Start the application**:

   ```bash
   docker-compose up -d
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
   export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/cardano_payroll
   export SPRING_DATASOURCE_USERNAME=postgres
   export SPRING_DATASOURCE_PASSWORD=your_password
   export BLOCKFROST_PROJECT_ID=your_project_id
   export COMPANY_WALLET_ADDRESS=your_wallet_address
   export COMPANY_SKEY=your_spending_key
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

3. **Start the development server**:
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

The frontend connects to the backend via environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

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

#### Manual Payroll Run

1. Go to the Payroll section
2. Click "Run Payroll"
3. Review the payroll summary
4. Confirm the transaction

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
```

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

**Solution**: Check backend service status and CORS configuration

```bash
# Verify backend is running
curl http://localhost:8080/actuator/health

# Check frontend environment variables
echo $NEXT_PUBLIC_API_BASE_URL
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
# Production Environment Variables
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db:5432/cardano_payroll
BLOCKFROST_PROJECT_ID=prod_blockfrost_project
COMPANY_WALLET_ADDRESS=prod_wallet_address
COMPANY_SKEY=prod_spending_key_encrypted
```

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
- **Spring Boot Team**: For the excellent framework
- **React Team**: For the powerful UI library
- **Open Source Community**: For the countless libraries and tools

---

**Built with ❤️ for the Cardano ecosystem**

For more information, visit our [documentation](docs/) or check out our [API reference](docs/api-reference.md).
