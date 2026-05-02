import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const springRes = await axios.post(`${API_URL}/api/v1/auth/register`, body);
    const data = springRes.data.data as { userId: string };
    return NextResponse.json({ userId: data.userId });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message ?? 'Registration failed',
          errors: error.response.data?.errors,
        },
        { status: error.response.status }
      );
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
