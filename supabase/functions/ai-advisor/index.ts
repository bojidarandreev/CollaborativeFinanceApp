import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Authenticate the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error("User auth error:", userError)
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Rate limiting (count advice requests in the last 24 hours)
    const { data: recentAdvice, error: rateLimitError } = await supabaseClient
      .from('ai_advice')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError)
      // Fail open, or return an error. For now, we'll return an error.
      return new Response(JSON.stringify({ error: 'Could not verify usage' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (recentAdvice && recentAdvice.length >= 5) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again tomorrow.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Fetch user's transactions
    const { data: transactions, error: transactionsError } = await supabaseClient
      .from('transactions')
      .select('date, amount, description')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(100) // Limit to the last 100 transactions for the snapshot

    if (transactionsError) {
      console.error("Transactions fetch error:", transactionsError)
      return new Response(JSON.stringify({ error: 'Failed to fetch transactions' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 4. Build redacted snapshot for the AI
    const snapshot = transactions.map(t => `${t.date}: ${t.description} ($${t.amount})`).join('\n')
    const systemPrompt = `You are a helpful financial advisor. Analyze the following list of recent transactions and provide brief, actionable advice. Focus on spending patterns, potential savings, and category analysis. The user wants concrete tips. Format your response as a JSON object with three keys: "summary" (a one-sentence overview), "positive_points" (an array of strings for good habits), and "areas_for_improvement" (an array of strings for suggestions).`
    const userPrompt = `Here are my recent transactions:\n\n${snapshot}`

    // 5. Call Groq API with streaming
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        ...corsHeaders,
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma-2-9b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: true, // Enable streaming
      }),
    })

    if (!groqResponse.ok) {
        const errorBody = await groqResponse.text();
        console.error("Groq API error:", errorBody);
        return new Response(JSON.stringify({ error: 'Failed to get advice from AI provider.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 6. Persist advice (will do this after stream is complete) and stream response
    // We need to read the stream to get the full response for saving, while also forwarding it to the client.
    const reader = groqResponse.body?.getReader();
    if (!reader) {
        return new Response(JSON.stringify({ error: 'Failed to read AI response stream.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let fullContent = "";
    let usage = { "total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0 };

    // Create a new ReadableStream to forward the data to the client
    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);

          // Process server-sent events from Groq
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data.trim() === '[DONE]') {
                controller.close();
                return;
              }
              try {
                const json = JSON.parse(data);
                // Extract content and usage
                if (json.choices[0]?.delta?.content) {
                  const contentChunk = json.choices[0].delta.content;
                  fullContent += contentChunk;
                  controller.enqueue(new TextEncoder().encode(contentChunk)); // Forward the content chunk
                }
                if (json.x_groq?.usage) {
                  usage = json.x_groq.usage;
                }
              } catch (e) {
                console.error("Error parsing stream JSON:", e);
              }
            }
          }
        }
      },
      cancel() {
        console.log("Stream cancelled by client.");
      }
    });

    // After the stream is finished, persist the full advice
    stream.closed.then(async () => {
        try {
            const adviceJson = JSON.parse(fullContent);
            // Groq pricing for gemma-2-9b-instruct: ~$0.10/1M tokens (input and output)
            const cost = (usage.total_tokens / 1_000_000) * 0.10;

            await supabaseClient.from('ai_advice').insert({
                user_id: user.id,
                snapshot_hash: 'placeholder_hash', // Should be a hash of the transaction data
                provider: 'groq',
                prompt_version: 1,
                advice: adviceJson,
                tokens_in: usage.prompt_tokens,
                tokens_out: usage.completion_tokens,
                cost_estimate: cost,
            });
            console.log("Successfully persisted AI advice.");
        } catch (e) {
            console.error("Failed to parse or persist AI advice:", e, "Full content:", fullContent);
        }
    });

    // Return the stream to the client
    return new Response(stream, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Main function error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
