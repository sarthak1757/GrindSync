/**
 * cleanupRevisions.js
 *
 * 1. Signs in as the demo account
 * 2. Finds all revisionQueue docs where scheduledFor is stored as a plain string
 * 3. Deletes them
 * 4. Spawns `seed.mjs` to recreate everything with proper Firestore Timestamps
 *
 * Run from the `grindsync/` directory:
 *   node scripts/cleanupRevisions.js
 */

import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

// ── Resolve paths ──────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // grindsync/

// ── Load .env from project root ────────────────────────────────────────────────
const envFile = fs.readFileSync(path.join(projectRoot, '.env'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/['"]/g, '');
    env[key] = val;
  }
});

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Helpers ────────────────────────────────────────────────────────────────────
/**
 * Returns true if the value is a plain ISO string (not a Firestore Timestamp).
 * Firestore Timestamps are objects with { seconds, nanoseconds }.
 */
function isStringDate(value) {
  return typeof value === 'string';
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n🧹 GrindSync Revision Cleanup Script\n');

  // 1. Sign in
  console.log('🔐 Signing in as demo@grindsync.com...');
  const creds = await signInWithEmailAndPassword(auth, 'demo@grindsync.com', 'Demo@123');
  const uid = creds.user.uid;
  console.log(`✅ Signed in! UID: ${uid}\n`);

  // 2. Fetch all revisionQueue docs
  console.log('📋 Fetching all revisionQueue documents...');
  const snap = await getDocs(collection(db, 'users', uid, 'revisionQueue'));
  console.log(`   Found ${snap.size} total revision(s).\n`);

  // 3. Find docs where scheduledFor is a plain string
  const staleRefs = [];
  snap.forEach(docSnap => {
    const data = docSnap.data();
    if (isStringDate(data.scheduledFor)) {
      staleRefs.push({ ref: docSnap.ref, title: data.questionTitle || docSnap.id });
    }
  });

  if (staleRefs.length === 0) {
    console.log('✅ No string-based scheduledFor documents found. Nothing to delete.\n');
  } else {
    console.log(`🗑  Deleting ${staleRefs.length} stale revision(s) with string scheduledFor...\n`);
    for (const { ref, title } of staleRefs) {
      await deleteDoc(ref);
      console.log(`   ✔ Deleted: "${title}"`);
    }
    console.log(`\n✅ Deleted ${staleRefs.length} stale revision(s).\n`);
  }

  // 4. Re-run seed.mjs
  console.log('🌱 Running seed.mjs to recreate demo data with proper Timestamps...\n');
  console.log('════════════════════════════════════════════\n');

  const seedPath = path.join(projectRoot, 'seed.mjs');
  const child = spawn('node', [seedPath], {
    cwd: projectRoot,
    stdio: 'inherit', // pipe child output directly to this terminal
  });

  child.on('exit', code => {
    if (code === 0) {
      console.log('\n✅ Cleanup + reseed complete!');
    } else {
      console.error(`\n❌ seed.mjs exited with code ${code}`);
      process.exit(code);
    }
  });
}

run().catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
