import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DBData } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> }
) {
    const { resource } = await params;
    const data = await db.read();

    if (resource in data) {
        return NextResponse.json(data[resource as keyof DBData]);
    }

    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> }
) {
    const { resource } = await params;
    const body = await request.json();

    try {
        if (resource === 'teachers') {
            await db.update('teachers', (list) => [...list, body]);
        } else if (resource === 'classrooms') {
            await db.update('classrooms', (list) => [...list, body]);
        } else if (resource === 'subjects') {
            await db.update('subjects', (list) => [...list, body]);
        } else if (resource === 'batches') {
            await db.update('batches', (list) => [...list, body]);
        } else if (resource === 'config') {
            await db.update('config', () => body);
        } else if (resource === 'schedule') {
            await db.update('schedule', () => body);
        } else {
            return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> }
) {
    const { resource } = await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    try {
        if (resource === 'teachers') {
            await db.update('teachers', (list) => list.filter(t => t.id !== id));
        } else if (resource === 'classrooms') {
            await db.update('classrooms', (list) => list.filter(c => c.id !== id));
        } else if (resource === 'subjects') {
            await db.update('subjects', (list) => list.filter(s => s.id !== id));
        } else if (resource === 'batches') {
            await db.update('batches', (list) => list.filter(b => b.id !== id));
        } else {
            return NextResponse.json({ error: 'Invalid resource for delete' }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
