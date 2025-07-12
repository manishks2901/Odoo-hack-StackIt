import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/db-test';

export async function GET() {
  try {
    const result = await testDatabaseConnection();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({ error: 'Database test failed' }, { status: 500 });
  }
}
