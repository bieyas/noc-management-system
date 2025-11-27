# 🤝 Contributing to NOC Management System

First off, thank you for considering contributing to NOC Management System! It's people like you that make this project better for everyone in the ISP community.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Guidelines](#testing-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by respect, professionalism, and inclusivity. Please be kind and constructive in all interactions.

## 🎯 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (OS, Node.js version, database version)
- **Error logs** if applicable
- **Screenshots** if relevant

**Bug Report Template:**
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Ubuntu 22.04
- Node.js: v20.10.0
- MariaDB: 10.11
- npm: 10.2.3

## Error Logs
```
Paste error logs here
```

## Screenshots
If applicable
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Detailed explanation** of the proposed feature
- **Use cases** - why is this needed?
- **Possible implementation** if you have ideas
- **Examples** from other projects if relevant

### Pull Requests

We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing style
5. Write a clear commit message

## 🛠️ Development Setup

### Prerequisites
- Node.js v18+ LTS
- Docker & Docker Compose
- Git
- MariaDB 10.11+
- Redis 7+

### Setup Steps

1. **Fork and Clone**
```bash
git clone https://github.com/YOUR-USERNAME/nocman.git
cd nocman
```

2. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

3. **Setup Environment**
```bash
# Start Docker services
cd docker
cp .env.example .env
docker-compose up -d

# Setup backend
cd ../backend
cp .env.example .env
npm install
```

4. **Initialize Database**
```bash
npm run db:sync
npm run seed:admin
npm run seed:data  # Optional: for testing
```

5. **Start Development Server**
```bash
npm run dev
```

6. **Run Tests**
```bash
# Integration tests
./test-integration.sh

# Basic API tests
./test-api.sh
```

## 📝 Coding Standards

### JavaScript Style Guide

- Use **ES6+** features
- Use **async/await** instead of callbacks
- Use **const** for constants, **let** for variables (avoid var)
- Use **arrow functions** where appropriate
- Use **destructuring** when it improves readability
- Use **template literals** for string interpolation

### File Organization

```
backend/src/
├── config/          # Configuration files
├── controllers/     # Request handlers (thin layer)
├── models/          # Database models (Sequelize)
├── routes/          # API routes
├── services/        # Business logic (fat layer)
├── middleware/      # Express middleware
└── utils/           # Helper functions
```

### Naming Conventions

- **Files**: camelCase (e.g., `userController.js`)
- **Classes**: PascalCase (e.g., `class UserService`)
- **Functions**: camelCase (e.g., `function getUserById()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `const MAX_RETRY = 3`)
- **Database models**: PascalCase (e.g., `User`, `Customer`)
- **Routes**: kebab-case (e.g., `/api/network-logs`)

### Code Example

**Good:**
```javascript
// Controller - thin layer
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.findById(req.params.id);
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// Service - business logic
exports.findById = async (customerId) => {
  const customer = await Customer.findByPk(customerId, {
    include: [{ model: Subscription, as: 'subscriptions' }]
  });
  
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }
  
  return customer;
};
```

**Bad:**
```javascript
// Don't put business logic in controllers
exports.getCustomer = async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(customer);
};
```

### Error Handling

Always use try-catch with async/await:

```javascript
// Good
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  throw new AppError('Operation failed', 500);
}

// Bad
const result = await someAsyncOperation(); // No error handling!
```

### Database Queries

Use Sequelize ORM properly:

```javascript
// Good - with includes
const device = await Device.findByPk(deviceId, {
  include: [
    { model: Customer, as: 'customer' },
    { model: NetworkLog, as: 'logs', limit: 10 }
  ]
});

// Good - with where clause
const activeCustomers = await Customer.findAll({
  where: { status: 'active' },
  order: [['createdAt', 'DESC']]
});

// Bad - N+1 queries
const devices = await Device.findAll();
for (const device of devices) {
  device.customer = await Customer.findByPk(device.customerId);
}
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(customer): add bulk import functionality"

# Bug fix
git commit -m "fix(auth): resolve JWT token expiration issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(device): optimize ping monitoring logic"

# With body and breaking change
git commit -m "feat(api): add rate limiting

Add rate limiting middleware to prevent API abuse.
Default: 100 requests per 15 minutes.

BREAKING CHANGE: API now requires API key for high volume usage"
```

## 🔄 Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add/update API documentation
   - Update CHANGELOG.md

2. **Add Tests**
   - Write integration tests for new features
   - Ensure all tests pass
   - Aim for good test coverage

3. **Update Dependencies**
   - Keep dependencies up to date
   - Document any new dependencies

4. **Create Pull Request**
   - Use a clear title following commit conventions
   - Fill out the PR template
   - Link related issues
   - Request review from maintainers

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] CHANGELOG.md updated

## Related Issues
Closes #123

## Screenshots (if applicable)
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# All integration tests
./test-integration.sh

# Basic API tests
./test-api.sh

# Manual testing
npm run dev
# Use curl or Postman to test endpoints
```

### Writing Tests

Add tests to `test-integration.sh`:

```bash
# Test new endpoint
echo "Testing new feature..."
response=$(curl -s -X POST "$BASE_URL/api/new-endpoint" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}')

if echo "$response" | grep -q "expected_value"; then
  echo "✅ Test passed"
else
  echo "❌ Test failed"
  exit 1
fi
```

### Test Coverage Goals

- All API endpoints should have integration tests
- Critical business logic should have unit tests
- Error handling should be tested
- Edge cases should be covered

## 🎨 Style Guide

### Comments

```javascript
// Good - explain WHY, not WHAT
// Retry 3 times because network can be unstable
const MAX_RETRY = 3;

// Bad - obvious comment
// Set max retry to 3
const MAX_RETRY = 3;
```

### Function Documentation

```javascript
/**
 * Find customer by ID with relationships
 * @param {string} customerId - Customer unique identifier
 * @param {Object} options - Query options
 * @param {boolean} options.includeDevices - Include customer devices
 * @returns {Promise<Customer>} Customer object with relationships
 * @throws {AppError} When customer not found
 */
async function findCustomerById(customerId, options = {}) {
  // Implementation
}
```

## 🐛 Debugging Tips

### Enable Debug Logs

```bash
# In .env
NODE_ENV=development
DEBUG=nocman:*
```

### Database Query Logging

```javascript
// In config/database.js
const sequelize = new Sequelize({
  logging: console.log  // or false to disable
});
```

### Common Issues

**Database Connection Failed:**
- Check Docker services: `docker-compose ps`
- Verify credentials in .env match docker/.env

**JWT Token Invalid:**
- Check JWT_SECRET is consistent
- Verify token expiration

**Port Already in Use:**
- Change PORT in .env
- Or kill existing process: `lsof -ti:5000 | xargs kill`

## 📚 Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MariaDB Documentation](https://mariadb.org/documentation/)

## 💡 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Chat**: Join our Discord (if available)
- **Email**: For security issues, email directly

## 🌟 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in commit history

Thank you for contributing! 🎉

---

**Remember**: Good code is readable code. When in doubt, prioritize clarity over cleverness.
