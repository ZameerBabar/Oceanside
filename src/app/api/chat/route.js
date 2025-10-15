// src/app/api/chat/route.js (FINAL VERSION)

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { NextResponse } from 'next/server';

// TavilySearchResults ko fix kiya gaya hai
import { TavilySearchResults } from "@langchain/community/tools/tavily_search"; 
// Firebase helpers ko import karen
import { getSignedMediaURL } from "./firebase-utils"; 

// ----------------------------------------------------
// 1. Setup Clients (Environment variables jo load ho rahe hain)
// ----------------------------------------------------

// OpenAI key (NEXT_PUBLIC_ prefix wala use kiya gaya hai)
const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY }); 
// Tavily client ka naam aur key
const tavilySearch = new TavilySearchResults({ apiKey: process.env.TAVILY_API_KEY }); 

// Supabase Client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ----------------------------------------------------
// 2. API Route Handler (The Core Logic - App Router)
// ----------------------------------------------------

export async function POST(request) {
    
    let requestBody;
    try {
        requestBody = await request.json();
    } catch (e) {
        return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    // User se query (question) aur optional 'userId' liya gaya
    const { query, userId } = requestBody; 
    
    if (!query) {
        return NextResponse.json({ message: "Query is required." }, { status: 400 });
    }

    try {
        // 1. Query Embedding
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small", 
            input: query,
        });
        const userEmbedding = embeddingResponse.data[0].embedding;

        // 2. Supabase Search (RAG)
        const { data: docs, error } = await supabase.rpc("match_documents", {
            query_embedding: userEmbedding,
            match_threshold: 0.8,
            match_count: 3
        });

        if (error) {
            console.error("Supabase search error:", error);
        }

        // ----------------------------------------------------
        // CASE A: Official Answer Found in Manuals (RAG)
        // ----------------------------------------------------
        if (docs && docs.length > 0) {
            const doc = docs[0];
            const attachments = [];

            // If document has media, sign URLs from Firebase
            if (doc.metadata?.media?.image) {
                const url = await getSignedMediaURL(doc.metadata.media.image, userId);
                if (url) attachments.push({ type: "image", url, fileName: doc.metadata.media.image });
            }
            if (doc.metadata?.media?.video) {
                const url = await getSignedMediaURL(doc.metadata.media.video, userId);
                 if (url) attachments.push({ type: "video", url, fileName: doc.metadata.media.video });
            }
            
             // Summarize with GPT
             const gptResponse = await openai.chat.completions.create({
                model: "gpt-4o-mini", 
                messages: [
                    {
                        role: "system",
                        content: `You are an AI assistant for a restaurants staff, providing ONLY official answers from the provided context. Be concise.`,
                    },
                    { role: "user", content: `Question: ${query}\n\nContext from Manuals:\n${doc.content}` },
                ],
            });

            return NextResponse.json({ 
                message: gptResponse.choices[0].message.content, // Summarized answer
                attachments: attachments,
                source: "Official Restaurant Manuals",
            }, { status: 200 });
        }

        // ----------------------------------------------------
        // CASE B: Fallback to Web Search
        // ----------------------------------------------------
        
        // TavilySearchResults se result nikalna
        const webResultsString = await tavilySearch.call(query);
        const webResults = JSON.parse(webResultsString);
        
        const gptSummary = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an assistant summarizing web search results. Summarize the provided JSON web data into a concise, easy-to-read text answer. Do not use information outside of the provided JSON.",
                },
                { role: "user", content: `Summarize this web info: ${JSON.stringify(webResults)}` }
            ]
        });

        return NextResponse.json({ 
            message: `I couldn't find an official answer in the manuals. Based on external web sources: \n\n${gptSummary.choices[0].message.content}`,
            attachments: [],
            source: "External Web Search",
        }, { status: 200 });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ message: `An unexpected server error occurred: ${error.message}` }, { status: 500 });
    }
}