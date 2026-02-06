// tests/server.test.js
import request from 'supertest';
import app from '../src/server.js';

describe('API Server', () => {
    it('GET /api/test debería responder con mensaje de API funcionando', async () => {
        const res = await request(app).get('/api/test');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'API funcionando');
    });

    it('GET /ruta-inexistente debería retornar 404', async () => {
        const res = await request(app).get('/ruta-inexistente');
        expect(res.statusCode).toEqual(404);
    });
});
