export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, nip, schoolName } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const mockToken = `mock-jwt-token-${Date.now()}`;

    return Response.json(
      {
        success: true,
        message: 'Registrasi guru berhasil!',
        data: {
          token: mockToken,
          user: {
            name: name || 'Guru Bulaeng',
            email,
            nip: nip || null,
            schoolName: schoolName || '',
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registrasi:', error);
    return Response.json(
      { success: false, message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}