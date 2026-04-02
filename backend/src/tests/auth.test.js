import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import { prisma } from '../config/prisma.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const users = new Map();

const originalFindUnique = prisma.user.findUnique.bind(prisma.user);
const originalCreate = prisma.user.create.bind(prisma.user);

prisma.user.findUnique = async ({ where }) => users.get(where.email) || null;
prisma.user.create = async ({ data }) => {
  const user = {
    id: `user_${users.size + 1}`,
    name: data.name,
    email: data.email,
    password: data.password,
    role: 'CUSTOMER'
  };

  users.set(user.email, user);
  return user;
};

const postJson = async (baseUrl, path, payload) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await response.json();
  return { status: response.status, body };
};

test('authentication endpoints handle happy path and invalid credentials', async () => {
  const server = app.listen(0);

  try {
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    users.clear();
    const registerResponse = await postJson(baseUrl, '/register', {
      name: 'Auth Tester',
      email: 'auth.tester@example.com',
      password: 'strongpass123'
    });

    assert.equal(registerResponse.status, 201);
    assert.equal(registerResponse.body.message, 'Registered successfully.');
    assert.equal(registerResponse.body.user.email, 'auth.tester@example.com');
    assert.ok(registerResponse.body.token);

    const duplicateResponse = await postJson(baseUrl, '/register', {
      name: 'Auth Tester',
      email: 'auth.tester@example.com',
      password: 'strongpass123'
    });

    assert.equal(duplicateResponse.status, 409);
    assert.equal(duplicateResponse.body.message, 'Email already registered.');

    const loginResponse = await postJson(baseUrl, '/login', {
      email: 'auth.tester@example.com',
      password: 'strongpass123'
    });

    assert.equal(loginResponse.status, 200);
    assert.equal(loginResponse.body.message, 'Login successful.');
    assert.ok(loginResponse.body.token);

    const invalidLoginResponse = await postJson(baseUrl, '/login', {
      email: 'auth.tester@example.com',
      password: 'wrong-password'
    });

    assert.equal(invalidLoginResponse.status, 401);
    assert.equal(invalidLoginResponse.body.message, 'Invalid credentials.');

    users.set('lower@example.com', {
      id: 'user_lowercase',
      name: 'Lower',
      email: 'lower@example.com',
      password: await bcrypt.hash('secret123', 10),
      role: 'CUSTOMER'
    });

    const loginCaseResponse = await postJson(baseUrl, '/login', {
      email: 'LOWER@EXAMPLE.COM',
      password: 'secret123'
    });

    assert.equal(loginCaseResponse.status, 200);
    assert.equal(loginCaseResponse.body.user.email, 'lower@example.com');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test.after(() => {
  prisma.user.findUnique = originalFindUnique;
  prisma.user.create = originalCreate;
});
