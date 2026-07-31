import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/tasks - list all active (non-archived) tasks
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const showArchived = searchParams.get('archived') === 'true';

  const tasks = showArchived
    ? db.prepare('SELECT * FROM tasks WHERE archived_at IS NOT NULL ORDER BY created_at DESC').all()
    : db.prepare('SELECT * FROM tasks WHERE archived_at IS NULL ORDER BY created_at DESC').all();

  return NextResponse.json(tasks);
}

// POST /api/tasks - create a new task
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, due_date, topic } = body;

  if (!title || !due_date || !topic) {
    return NextResponse.json(
      { error: 'title, due_date, and topic are required' },
      { status: 400 }
    );
  }

  const result = db.prepare(
    'INSERT INTO tasks (title, description, due_date, topic) VALUES (?, ?, ?, ?)'
  ).run(title, description ?? null, due_date, topic);

  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(newTask, { status: 201 });
}