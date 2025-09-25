require('dotenv').config({ path: './env.txt' });
const request = require('supertest');
const app = require('./server.js');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

beforeAll(() => {
  // optional setup
});

afterAll(async () => {
  // Clean up: delete the test rows so they don’t remain
  await supabase
    .from('carparks')
    .delete()
    .in('name', ['Bugis Junction', 'Plaza Singapura']);
});

beforeEach(async () => {
  // delete the test rows if they exist
  await supabase
    .from('carparks')
    .delete()
    .in('name', ['Bugis Junction', 'Plaza Singapura']);

  // insert test data
  const { error } = await supabase.from('carparks').insert([
    {
      name: 'Bugis Junction',
      weekday_rate: '$1.20/30min',
      weekend_rate: '$1.50/30min',
      night_parking: 'Available: $4 after 8pm',
      region: 'Central'
    },
    {
      name: 'Plaza Singapura',
      weekday_rate: '$1.00/30min',
      weekend_rate: '$1.20/30min',
      night_parking: 'Not Available',
      region: 'Central'
    }
  ]);
  if (error) {
    throw error;
  }
});

// Your test suite
describe('Carparks API', () => {
  describe('GET /api/carparks', () => {
    it('should return all carparks', async () => {
      const res = await request(app).get('/api/carparks');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.some(cp => cp.name === 'Bugis Junction')).toBe(true);
    });
  });

  describe('GET /api/carparks/region/:region', () => {
    it('should return carparks in the specified region', async () => {
      const res = await request(app).get('/api/carparks/region/Central');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      // Since both inserted are Central, there should be at least 2
      expect(res.body.filter(cp => cp.region === 'Central').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/carparks/name/:name', () => {
    it('should return carparks matching the specified name', async () => {
      const res = await request(app).get('/api/carparks/name/Bugis');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Bugis Junction');
    });

    it('should return 404 if the carpark is not found', async () => {
      const response = await request(app).get('/api/carparks/name/NonExistentCarpark');
      expect(response.statusCode).toBe(404);
    });
  });
});
