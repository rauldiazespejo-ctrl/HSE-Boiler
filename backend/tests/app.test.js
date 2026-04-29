const request = require('supertest');
const app = require('../src/app');

describe('API baseline hardening', () => {
  it('returns healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('blocks protected documento routes without token', async () => {
    const response = await request(app).get('/api/v1/documentos');
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('blocks register when no admin token and public register disabled', async () => {
    process.env.ALLOW_PUBLIC_REGISTER = 'false';
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'new.user@hse.cl',
      password: 'Secret123!',
      nombre: 'New User',
      rol: 'trabajador',
    });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
