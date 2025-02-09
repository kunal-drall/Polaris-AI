import { NextResponse } from 'next/server';
import { AilfredAgent } from '../../../lib/agent';

let agent: AilfredAgent | null = null;

export async function POST(request: Request) {
  try {
    // Initialize agent if not already initialized
    if (!agent) {
      agent = await AilfredAgent.initialize();
    }

    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await agent.processMessage(message);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { 
        role: 'assistant',
        content: "I do apologize, sire, but I encountered an error while processing your request. Please try again.",
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
} 