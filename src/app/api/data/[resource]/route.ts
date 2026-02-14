import { NextRequest, NextResponse } from 'next/server';
import {
    getInitialData,
    addTeacher, updateTeacher, removeTeacher,
    addClassroom, updateClassroom, removeClassroom,
    addSubject, updateSubject, removeSubject,
    addBatch, updateBatch, removeBatch,
    updateConfig, saveSchedule
} from '@/lib/db';
import { Teacher, Classroom, Subject, Batch, SchedulerConfig } from '@/lib/types';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> }
) {
    const { resource } = await params;
    const data = await getInitialData();

    if (resource in data) {
        return NextResponse.json(data[resource as keyof typeof data]);
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
        switch (resource) {
            case 'teachers':
                await addTeacher(body as Teacher);
                break;
            case 'classrooms':
                await addClassroom(body as Classroom);
                break;
            case 'subjects':
                await addSubject(body as Subject);
                break;
            case 'batches':
                await addBatch(body as Batch);
                break;
            case 'config':
                await updateConfig(body as SchedulerConfig);
                break;
            case 'schedule':
                await saveSchedule(body);
                break;
            default:
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
        switch (resource) {
            case 'teachers':
                await removeTeacher(id);
                break;
            case 'classrooms':
                await removeClassroom(id);
                break;
            case 'subjects':
                await removeSubject(id);
                break;
            case 'batches':
                await removeBatch(id);
                break;
            default:
                return NextResponse.json({ error: 'Invalid resource for delete' }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
