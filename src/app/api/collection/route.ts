import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all collection images
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('collection')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ images: data || [] });
  } catch (error) {
    console.error('Failed to fetch collection:', error);
    return NextResponse.json({ images: [], error: 'Failed to fetch collection' }, { status: 500 });
  }
}

// POST - Add image to collection
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('collection')
      .select('id')
      .eq('url', url)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Already in collection', image: existing });
    }

    const { data, error } = await supabase
      .from('collection')
      .insert({ url })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ image: data });
  } catch (error) {
    console.error('Failed to add to collection:', error);
    return NextResponse.json({ error: 'Failed to add to collection' }, { status: 500 });
  }
}

// DELETE - Remove image from collection
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('collection')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete from collection:', error);
    return NextResponse.json({ error: 'Failed to delete from collection' }, { status: 500 });
  }
}
