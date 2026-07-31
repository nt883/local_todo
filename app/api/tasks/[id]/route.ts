import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/tasks/[id] - fetch a single task
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json(task);
}

// PATCH /api/tasks/[id] - edit fields, change status, or archive
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;

  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const {
    title = existing.title,
    description = existing.description,
    due_date = existing.due_date,
    topic = existing.topic,
    status = existing.status,
    archived, // boolean flag from the client to trigger archiving
  } = body;

  const archived_at =
    archived === true
      ? new Date().toISOString()
      : archived === false
      ? null
      : existing.archived_at;

  db.prepare(
    `UPDATE tasks
     SET title = ?, description = ?, due_date = ?, topic = ?, status = ?, archived_at = ?
     WHERE id = ?`
  ).run(title, description, due_date, topic, status, archived_at, id);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return NextResponse.json(updated);
}