export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'INITIAL_INGESTION') {
      console.log('📦 Data setup kelas diterima di backend:', payload);

      return Response.json(
        {
          success: true,
          message: 'Data setup kelas dan skenario AI berhasil disimpan!',
          data: payload,
        },
        { status: 200 }
      );
    }

    return Response.json(
      { success: false, message: 'Action tidak valid/tidak dikenal.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error pada API setup ingestion:', error);
    return Response.json(
      { success: false, message: 'Terjadi kesalahan pada server backend.' },
      { status: 500 }
    );
  }
}