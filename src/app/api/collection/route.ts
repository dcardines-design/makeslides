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

// POST - Add image(s) to collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both single URL and batch URLs with group name
    if (body.urls && Array.isArray(body.urls)) {
      // Batch insert with group name
      const { urls, groupName } = body;
      const insertData = urls.map((url: string) => ({
        url,
        group_name: groupName || null,
      }));

      const { data, error } = await supabase
        .from('collection')
        .upsert(insertData, { onConflict: 'url', ignoreDuplicates: true })
        .select();

      if (error) throw error;

      return NextResponse.json({ images: data || [], groupName });
    }

    // Single URL (backwards compatible)
    const { url, groupName } = body;

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
      .insert({ url, group_name: groupName || null })
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
