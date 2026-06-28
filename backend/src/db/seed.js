import bcrypt from 'bcrypt';
import '../config/env.config.js';
import { eq } from 'drizzle-orm';
import { db, pool } from '../config/db.config.js';
import { users } from '../app/onboardings/onboardings.schema.js';
import logger from '../logger/logger.js';

const seedCFO = async () => {
  const email = 'cfo@org.com';
  try {
    const existingUsers = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existingUsers.length) {
      logger.info('CFO account already exists; skipping seed');
      return;
    }

    const hashed = await bcrypt.hash('CFO#ORG@April2026', Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
    await db.insert(users).values({
      name: 'CFO User',
      email,
      password: hashed,
      role: 'CFO',
    });
    logger.info('CFO account seeded successfully');
  } catch (err) {
    logger.error(`Failed to seed CFO account: ${err?.message || err}`);
    throw err;
  } finally {
    await pool.end();
  }
};

seedCFO().catch((err) => {
  logger.error(`Seed failed: ${err?.message || err}`);
  process.exit(1);
});
