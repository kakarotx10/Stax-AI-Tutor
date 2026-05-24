/* eslint-disable @typescript-eslint/no-var-requires */
// Seed dev user abc@abc.com / 12345678
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EMAIL = 'abc@abc.com';
const PASSWORD = '12345678';
const NAME = 'Dev User';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME });
  const db = mongoose.connection.db;
  const users = db.collection('users');

  const existing = await users.findOne({ email: EMAIL });
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  if (existing) {
    await users.updateOne(
      { _id: existing._id },
      { $set: { passwordHash, name: NAME, updatedAt: new Date() } }
    );
    console.log(`Updated existing user ${EMAIL}`);
  } else {
    await users.insertOne({
      email: EMAIL,
      passwordHash,
      name: NAME,
      role: 'student',
      stats: { xp: 0, streak: 0, rank: 0, totalSolved: 0 },
      subscription: { plan: 'free' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Created user ${EMAIL}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
