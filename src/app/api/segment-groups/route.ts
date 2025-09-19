import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/segment-groups - Retrieve all segment groups
export async function GET() {
  try {
    const segmentGroups = await db.segmentGroup.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: segmentGroups
    });
  } catch (error) {
    console.error('Error fetching segment groups:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch segment groups',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/segment-groups - Create a new segment group
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, segmentsToInclude, segmentsToExclude } = body;

    // Validate required fields
    if (!name || !Array.isArray(segmentsToInclude) || !Array.isArray(segmentsToExclude)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'name, segmentsToInclude, and segmentsToExclude are required'
        },
        { status: 400 }
      );
    }

    const segmentGroup = await db.segmentGroup.create({
      data: {
        name,
        segmentsToInclude,
        segmentsToExclude
      }
    });

    return NextResponse.json({
      success: true,
      data: segmentGroup
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating segment group:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Segment group already exists',
          message: 'A segment group with this name already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create segment group',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
