import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all generation history
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('generation_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ history: data || [] });
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json({ history: [], error: 'Failed to fetch history' }, { status: 500 });
  }
}

// POST - Save generation to history
export async function POST(request: NextRequest) {
  try {
    const { prompt, style, slides } = await request.json();

    if (!prompt || !slides) {
      return NextResponse.json({ error: 'Prompt and slides are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('generation_history')
      .insert({
        prompt,
        style: style || 'casual',
        slides,
        slide_count: slides.length,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ entry: data });
  } catch (error) {
    console.error('Failed to save to history:', error);
    return NextResponse.json({ error: 'Failed to save to history' }, { status: 500 });
  }
}

// DELETE - Remove entry from history
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('generation_history')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete from history:', error);
    return NextResponse.json({ error: 'Failed to delete from history' }, { status: 500 });
  }
}
