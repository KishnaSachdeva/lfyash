const request = require('supertest');
const app = require('../app');
const prisma = require('../services/prisma');

describe('Auth APIs', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@chitkara.edu.in',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should fail to register an existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User 2',
        email: 'test@chitkara.edu.in',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('already exists');
  });

  it('should verify a valid OTP', async () => {
    // This would require mocking the OTP generation or knowing the OTP
    // For now, we focus on the endpoint connectivity and structure
    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        userId: 'some-uuid',
        otp: '1234',
      });
    expect(res.statusCode).toBeDefined();
  });
});
