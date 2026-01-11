import { NextRequest, NextResponse } from 'next/server';

type ContentStyle = 'casual' | 'professional' | 'genz' | 'motivational';

const stylePrompts: Record<ContentStyle, string> = {
  casual: `You are a viral TikTok content creator. Generate carousel slide content in JSON format.
Output ONLY valid JSON, no markdown or explanation. The format must be:
{"slides": [{"badge": "TITLE TEXT WITH EMOJI", "body": "2-3 sentences of advice"}]}

Rules:
- Badge should be short, punchy header text with emoji at the end (like "STEP 1: TRACK EXPENSES 📸" or "TAKEAWAY ✨")
- Body should be 2-3 conversational sentences
- First slide is intro/hook, last slide is takeaway/conclusion
- Use "you" and "your" to speak directly to reader
- Make it feel like advice from a friend
- Keep it casual and friendly`,

  professional: `You are a business content creator. Generate carousel slide content in JSON format.
Output ONLY valid JSON, no markdown or explanation. The format must be:
{"slides": [{"badge": "TITLE TEXT", "body": "2-3 sentences of professional advice"}]}

Rules:
- Badge should be clear, professional header text (minimal emojis, only one at end if needed)
- Body should be 2-3 well-structured sentences with business-appropriate language
- First slide is introduction, last slide is key takeaway
- Use professional language while remaining accessible
- Focus on actionable insights and best practices`,

  genz: `You are a Gen-Z TikTok creator who speaks to young audiences. Generate carousel slide content in JSON format.
Output ONLY valid JSON, no markdown or explanation. The format must be:
{"slides": [{"badge": "TITLE TEXT WITH EMOJIS 🔥✨", "body": "2-3 sentences with trendy language"}]}

Rules:
- Badge should be trendy with multiple emojis (like "NO CAP THIS WORKS 💯🔥" or "STEP 1 BESTIE ✨")
- Body should use Gen-Z slang naturally (slay, lowkey, highkey, fr fr, no cap, bestie, understood the assignment)
- First slide is a hook that grabs attention, last slide is the main takeaway
- Use lots of emojis throughout
- Make it feel like texting a friend
- Keep sentences short and punchy`,

  motivational: `You are an inspiring life coach creating motivational content. Generate carousel slide content in JSON format.
Output ONLY valid JSON, no markdown or explanation. The format must be:
{"slides": [{"badge": "TITLE TEXT WITH EMOJI ✨", "body": "2-3 inspiring sentences"}]}

Rules:
- Badge should be uplifting and encouraging with motivational emojis (✨💪🚀⭐)
- Body should inspire and encourage the reader
- First slide should hook with a powerful statement, last slide should leave them motivated
- Use empowering language: "You've got this", "Believe in yourself", "Take that first step"
- Focus on growth mindset and positive transformation
- Make the reader feel capable and inspired`,
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'casual', autoBackground = false } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      // Return mock data for demo purposes when no API key
      const mockSlides = generateMockSlides(prompt);
      if (autoBackground) {
        return NextResponse.json({
          slides: await addBackgroundsToSlides(mockSlides),
        });
      }
      return NextResponse.json({ slides: mockSlides });
    }

    const systemPrompt = stylePrompts[style as ContentStyle] || stylePrompts.casual;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'TikTok Slides Maker',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Create TikTok carousel slides for: "${prompt}". Return ONLY the JSON object.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      throw new Error('AI API error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    // Parse the JSON from the response
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Add backgrounds if autoBackground is enabled
        if (autoBackground && parsed.slides) {
          parsed.slides = await addBackgroundsToSlides(parsed.slides);
        }

        return NextResponse.json(parsed);
      }
      throw new Error('No JSON found in response');
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content);
      // Fall back to mock data if parsing fails
      const fallbackSlides = generateMockSlides(prompt);
      return NextResponse.json({
        slides: autoBackground ? await addBackgroundsToSlides(fallbackSlides) : fallbackSlides,
      });
    }
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

// Mock data generator for when no API key is available
function generateMockSlides(prompt: string): Array<{ badge: string; body: string }> {
  const lowerPrompt = prompt.toLowerCase();

  // Extract number from prompt or default to 5
  const numMatch = prompt.match(/(\d+)/);
  const numSlides = numMatch ? Math.min(parseInt(numMatch[1]), 10) : 5;

  // Detect topic
  let topic = 'tips';
  if (lowerPrompt.includes('budget')) topic = 'budgeting';
  else if (lowerPrompt.includes('product')) topic = 'productivity';
  else if (lowerPrompt.includes('fitness') || lowerPrompt.includes('workout')) topic = 'fitness';
  else if (lowerPrompt.includes('cook') || lowerPrompt.includes('recipe')) topic = 'cooking';
  else if (lowerPrompt.includes('money') || lowerPrompt.includes('save')) topic = 'saving money';

  const templates: Record<string, Array<{ badge: string; body: string }>> = {
    budgeting: [
      { badge: 'BUDGETING FOR BEGINNERS ✨', body: 'this is how i actually started managing my money. no spreadsheets. no hassle. just simple steps that work.' },
      { badge: 'STEP 1: TRACK BEFORE YOU BUDGET 📸', body: 'before budgets, i just focused on capturing every expense. awareness first, rules later. scan receipts when you have them, manually add when you don\'t.' },
      { badge: 'STEP 2: USE CATEGORIES 🍎', body: 'let the system organize for you. pick from existing categories or create your own. structure before judgment.' },
      { badge: 'STEP 3: SET TARGET BUDGETS 🎯', body: 'set category budgets that match real life. daily, weekly, or monthly. the app auto calculates everything for you.' },
      { badge: 'STEP 4: WATCH PROGRESS 📊', body: 'visual > math. progress bars show how close you are to your limit before it\'s too late.' },
      { badge: 'STEP 5: REVIEW TRENDS 😌', body: 'look back regularly. check charts weekly or monthly to spot habits and adjust.' },
      { badge: 'STEP 6: STAY CONSISTENT 💪', body: 'small habits win. miss a day, keep going. consistency matters more than being perfect.' },
      { badge: 'TAKEAWAY ✨', body: 'budgeting starts with awareness. once you see where your money goes, better decisions follow naturally.' },
    ],
    productivity: [
      { badge: 'PRODUCTIVITY HACKS THAT WORK ✨', body: 'forget hustle culture. here\'s what actually helps you get more done without burning out.' },
      { badge: 'TIP 1: TIME BLOCK YOUR DAY 📅', body: 'don\'t just make a to-do list. assign specific times to tasks. your calendar is your best friend.' },
      { badge: 'TIP 2: EAT THE FROG FIRST 🐸', body: 'do your hardest task first thing in the morning. everything else feels easier after.' },
      { badge: 'TIP 3: THE 2-MINUTE RULE ⚡', body: 'if it takes less than 2 minutes, do it now. small tasks pile up and drain your energy.' },
      { badge: 'TIP 4: BATCH SIMILAR TASKS 📦', body: 'group similar activities together. emails at set times. calls in one block. context switching kills productivity.' },
      { badge: 'TIP 5: TAKE REAL BREAKS 😴', body: 'your brain needs rest to perform. step away from screens. a 10-min walk beats scrolling.' },
      { badge: 'TAKEAWAY ✨', body: 'productivity isn\'t about doing more. it\'s about doing what matters with less stress.' },
    ],
    'saving money': [
      { badge: 'HOW I SAVE MONEY 💰', body: 'these aren\'t extreme tips. just small changes that add up to big savings over time.' },
      { badge: 'TIP 1: AUTOMATE SAVINGS 🏦', body: 'set up auto-transfer to savings on payday. you can\'t spend what you don\'t see.' },
      { badge: 'TIP 2: WAIT 24 HOURS ⏰', body: 'before any non-essential purchase over $50, sleep on it. most impulse buys lose their appeal.' },
      { badge: 'TIP 3: UNSUBSCRIBE 📱', body: 'audit your subscriptions monthly. that $10/month adds up to $120/year you might not need to spend.' },
      { badge: 'TIP 4: COOK MORE 🍳', body: 'meal prep doesn\'t have to be fancy. even 2-3 home-cooked meals per week saves hundreds monthly.' },
      { badge: 'TAKEAWAY ✨', body: 'saving money is a habit, not a sacrifice. start small and watch it grow.' },
    ],
    tips: [
      { badge: 'LIFE TIPS YOU NEED ✨', body: 'simple advice that actually makes a difference. no fluff, just real talk.' },
      { badge: 'TIP 1: START BEFORE YOU\'RE READY 🚀', body: 'perfectionism is procrastination in disguise. done is better than perfect.' },
      { badge: 'TIP 2: SAY NO MORE OFTEN 🙅', body: 'every yes to something unimportant is a no to something that matters.' },
      { badge: 'TIP 3: INVEST IN YOURSELF 📚', body: 'books, courses, experiences. the ROI on self-improvement is infinite.' },
      { badge: 'TIP 4: PROTECT YOUR ENERGY ⚡', body: 'you are the average of the 5 people you spend most time with. choose wisely.' },
      { badge: 'TAKEAWAY ✨', body: 'small consistent actions beat big inconsistent efforts. start today.' },
    ],
    fitness: [
      { badge: 'FITNESS FOR BEGINNERS 💪', body: 'you don\'t need a gym membership or fancy equipment. here\'s how to start.' },
      { badge: 'TIP 1: JUST SHOW UP 🏃', body: 'on days you don\'t feel like it, just do 10 minutes. starting is the hardest part.' },
      { badge: 'TIP 2: PROGRESSIVE OVERLOAD 📈', body: 'add a little more each week. one more rep, 5 more pounds. small gains compound.' },
      { badge: 'TIP 3: RECOVERY MATTERS 😴', body: 'muscles grow when you rest, not when you lift. sleep 7-8 hours and take rest days.' },
      { badge: 'TIP 4: TRACK YOUR WORKOUTS 📝', body: 'what gets measured gets improved. use an app or simple notes.' },
      { badge: 'TAKEAWAY ✨', body: 'consistency beats intensity. a mediocre workout done regularly beats a perfect workout done never.' },
    ],
    cooking: [
      { badge: 'COOKING MADE SIMPLE 👨‍🍳', body: 'you don\'t need to be a chef. these basics will transform your home cooking.' },
      { badge: 'TIP 1: MISE EN PLACE 🥗', body: 'prep everything before you start cooking. it makes the process so much smoother.' },
      { badge: 'TIP 2: SEASON AS YOU GO 🧂', body: 'taste your food while cooking. building flavor in layers is the secret of good cooks.' },
      { badge: 'TIP 3: HIGH HEAT FOR CRISPY 🔥', body: 'want that restaurant crisp? let your pan get hot before adding food. don\'t crowd it.' },
      { badge: 'TIP 4: REST YOUR MEAT 🥩', body: 'let cooked meat rest for 5-10 mins before cutting. keeps all those juices inside.' },
      { badge: 'TAKEAWAY ✨', body: 'cooking is a skill anyone can learn. start simple and have fun with it.' },
    ],
  };

  const slideSet = templates[topic] || templates.tips;

  // Return requested number of slides (or all available if fewer)
  if (numSlides >= slideSet.length) {
    return slideSet;
  }

  // For fewer slides, include intro, some middle tips, and takeaway
  const result = [slideSet[0]]; // intro
  const middleCount = numSlides - 2;
  for (let i = 0; i < middleCount && i < slideSet.length - 2; i++) {
    result.push(slideSet[i + 1]);
  }
  result.push(slideSet[slideSet.length - 1]); // takeaway

  return result;
}

// Extract keywords from slide content for image search
function extractKeywords(badge: string, body: string): string {
  // Remove emojis and common words
  const text = `${badge} ${body}`.toLowerCase();
  const cleaned = text.replace(/[\u{1F600}-\u{1F6FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F300}-\u{1F5FF}]/gu, '');

  // Extract key topic words
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'your', 'you', 'it', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'step', 'tip', 'takeaway', 'intro'];

  const words = cleaned.split(/\W+/).filter(word =>
    word.length > 3 && !stopWords.includes(word)
  );

  // Return unique keywords, max 3
  const unique = [...new Set(words)].slice(0, 3);
  return unique.join(' ') || 'aesthetic lifestyle';
}

// Sample aesthetic background images for when no API key is available
const sampleBackgrounds = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1080',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1080',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1080',
  'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=1080',
  'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=1080',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1080',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1080',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1080',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1080',
  'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1080',
];

// Add background images to slides using Unsplash API
async function addBackgroundsToSlides(
  slides: Array<{ badge: string; body: string }>
): Promise<Array<{ badge: string; body: string; backgroundImage?: string }>> {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!unsplashKey) {
    // Use sample backgrounds when no API key
    return slides.map((slide, index) => ({
      ...slide,
      backgroundImage: sampleBackgrounds[index % sampleBackgrounds.length],
    }));
  }

  const slidesWithBackgrounds = await Promise.all(
    slides.map(async (slide, index) => {
      try {
        const keywords = extractKeywords(slide.badge, slide.body);
        const searchQuery = `${keywords} aesthetic`;

        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=portrait`,
          {
            headers: {
              Authorization: `Client-ID ${unsplashKey}`,
            },
          }
        );

        if (!response.ok) {
          console.error('Unsplash API error for slide', index);
          // Fallback to sample image
          return {
            ...slide,
            backgroundImage: sampleBackgrounds[index % sampleBackgrounds.length],
          };
        }

        const data = await response.json();
        const photos = data.results || [];

        // Pick a random photo from top results to add variety
        const randomIndex = Math.min(index % 3, photos.length - 1);
        const photo = photos[randomIndex] || photos[0];

        return {
          ...slide,
          backgroundImage: photo?.urls?.regular || sampleBackgrounds[index % sampleBackgrounds.length],
        };
      } catch (error) {
        console.error('Error fetching background for slide', index, error);
        // Fallback to sample image
        return {
          ...slide,
          backgroundImage: sampleBackgrounds[index % sampleBackgrounds.length],
        };
      }
    })
  );

  return slidesWithBackgrounds;
}
