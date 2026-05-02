import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    // Try cookie first, then body (for localStorage-initiated refresh)
    const cookieRefreshToken = req.cookies.get('refresh_token')?.value;
    const body = await req.json().catch(() => ({}));
    const refreshToken = cookieRefreshToken ?? body.refreshToken;

    if (!refreshToken) {
      return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
    }

    const springRes = await axios.post(
      `${API_URL}/api/v1/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    );

    const { accessToken, refreshToken: newRefreshToken } = springRes.data.data as {
      accessToken: string;
      refreshToken?: string;
    };

    const response = NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
    });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    });

    if (newRefreshToken) {
      response.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { message: error.response.data?.message ?? 'Token refresh failed' },
        { status: error.response.status }
      );
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
