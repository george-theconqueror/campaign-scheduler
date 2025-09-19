import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/segment-groups/[id] - Retrieve a specific segment group by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const segmentGroup = await db.segmentGroup.findUnique({
      where: { id }
    });

    if (!segmentGroup) {
      return NextResponse.json(
        {
          success: false,
          error: 'Segment group not found',
          message: `No segment group found with ID: ${id}`
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: segmentGroup
    });
  } catch (error) {
    console.error('Error fetching segment group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch segment group',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/segment-groups/[id] - Update a segment group by ID
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Check if segment group exists
    const existingGroup = await db.segmentGroup.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      return NextResponse.json(
        {
          success: false,
          error: 'Segment group not found',
          message: `No segment group found with ID: ${id}`
        },
        { status: 404 }
      );
    }

    const updatedSegmentGroup = await db.segmentGroup.update({
      where: { id },
      data: {
        name,
        segmentsToInclude,
        segmentsToExclude
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSegmentGroup
    });
  } catch (error) {
    console.error('Error updating segment group:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Segment group name already exists',
          message: 'A segment group with this name already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update segment group',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/segment-groups/[id] - Delete a segment group by ID
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Check if segment group exists
    const existingGroup = await db.segmentGroup.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      return NextResponse.json(
        {
          success: false,
          error: 'Segment group not found',
          message: `No segment group found with ID: ${id}`
        },
        { status: 404 }
      );
    }

    await db.segmentGroup.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Segment group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting segment group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete segment group',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
