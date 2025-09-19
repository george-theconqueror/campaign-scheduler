import { getSegments } from '@/lib/klaviyo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const segments = await getSegments();
    
    return NextResponse.json({
      success: true,
      data: segments,
      count: segments.length
    });
    
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch segments',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
