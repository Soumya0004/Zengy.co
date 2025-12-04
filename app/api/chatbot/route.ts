import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // no need for "!"
});

// You can customize this with your real store info
const STORE_INFO = `
Store name: zengy.go
Products: Clothing, Accessories, Footwear
Location: India
Delivery time: 3-7 working days depending on location.
Cash on Delivery: Available on selected products.
Return policy: 7 days return for unused items with tags.
Support:
- Email: support@zengy.go
- WhatsApp: +91-xxxxxxxxxx
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message || "";

    const systemPrompt = `
You are a helpful AI assistant for an Indian e-commerce website.
Use the following store info when answering:

${STORE_INFO}

Rules:
- Answer clearly and simply.
- If user asks about something you don't know (exact stock, exact order status, payment failure logs), say you don't know and ask them to contact support.
- If user asks about products, ask their price range, color preference etc if needed.
- DO NOT invent fake discounts or policies.
    `;

    const response = await client.responses.create({
      model: "gpt-4.1-mini", // ✅ FIXED MODEL NAME
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    // ✅ Safely extract text from the response
    let reply = "";

    // Newer Responses API often has `output[0].content[0].text`
    const output = (response as any).output;
    if (Array.isArray(output) && output.length > 0) {
      const first = output[0];
      if (Array.isArray(first.content) && first.content.length > 0) {
        const firstBlock = first.content[0];
        if (typeof firstBlock.text === "string") {
          reply = firstBlock.text;
        }
      }
    }

    // Fallback if reply is still empty
    if (!reply) {
      reply = "Sorry, I couldn't generate a response. Please try again.";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { reply: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
