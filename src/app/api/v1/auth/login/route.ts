export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrNip, password } = body;

    if (!emailOrNip || !password) {
      return Response.json(
        { success: false, message: 'Email/NIP dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const mockToken = `mock-jwt-token-${Date.now()}`;

    return Response.json(
      {
        success: true,
        message: 'Login berhasil!',
        token: mockToken,
        user: {
          emailOrNip,
          role: 'TEACHER',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error login:', error);
    return Response.json(
      { success: false, message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}