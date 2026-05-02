import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const springRes = await axios.post(`${API_URL}/api/v1/auth/login`, body);
    const { accessToken, refreshToken, requiresApproval, inGracePeriod, ...user } = springRes.data.data;

    const response = NextResponse.json({ accessToken, refreshToken, requiresApproval, inGracePeriod, user });

    // httpOnly cookies for server-side security
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message ?? 'Login failed',
          data: error.response.data?.data,
        },
        { status: error.response.status }
      );
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
