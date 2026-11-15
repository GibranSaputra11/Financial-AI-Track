const { GoogleGenAI, Type } = require('@google/genai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tidak dikonfigurasi di environment variables');
  }
  return new GoogleGenAI({ apiKey });
};

const extractReceiptWithGemini = async (imageBuffer, mimeType) => {
  try {
    const ai = getGeminiClient();
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const prompt = `Analisis struk atau nota belanja ini dan ekstrak informasi berikut ke dalam format JSON:
    1. merchant: Nama toko/warung/merchant (string, null jika tidak ada).
    2. amount: Total nominal uang dalam angka bulat/desimal (number, wajib ada, pastikan teliti membaca angka total).
    3. transactionDate: Tanggal transaksi dalam format YYYY-MM-DD (string, gunakan tanggal hari ini jika tidak tertera).
    4. category: Pilih salah satu dari kategori berikut yang paling sesuai: ['Kos', 'Makan', 'Tugas/Print', 'Nongkrong', 'Transportasi', 'Lainnya'] (string).
    5. description: Keterangan singkat atau item yang dibeli (string, null jika tidak ada).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [prompt, imagePart],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            transactionDate: { type: Type.STRING },
            category: { 
              type: Type.STRING,
              enum: ['Kos', 'Makan', 'Tugas/Print', 'Nongkrong', 'Transportasi', 'Lainnya']
            },
            description: { type: Type.STRING },
          },
          required: ['amount', 'category', 'transactionDate'],
        },
      },
    });

    const resultText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(resultText);
  } catch (error) {
    console.error('❌ Error Gemini OCR:', error);
    throw new Error('Gagal mengekstrak struk dengan Gemini AI: ' + error.message);
  }
};

const generateBudgetAdvisorWithGemini = async (walletData, recentTransactions) => {
  try {
    const ai = getGeminiClient();
    
    const prompt = `Bertindaklah sebagai AI Budgeting Advisor yang profesional, tegas, dan ramah untuk mahasiswa Indonesia (Financial AI Track). 
    Analisis data keuangan pengguna berikut:
    - Sisa Saldo / Budget: Rp ${walletData.totalBalance}
    - Target Budget Bulanan: Rp ${walletData.monthlyBudget || 0}
    - Sisa Hari di Bulan Ini: ${walletData.remainingDays} hari
    - Jatah Harian Ideal: Rp ${walletData.dailyAllowance}
    - Riwayat Transaksi Terakhir (10 transaksi): ${JSON.stringify(recentTransactions)}

    Buatlah analisis rekomendasi pembelanjaan dalam bentuk Tabel Interaktif dan Saran Penghematan untuk membantu mahasiswa bertahan sampai akhir bulan tanpa krisis akhir bulan. Output wajib JSON murni sesuai schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { 
              type: Type.STRING,
              enum: ['AMAN', 'WASPADA', 'KRITIS']
            },
            summary: { type: Type.STRING },
            dailyAdvice: { type: Type.STRING },
            tableRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  dailyAllocation: { type: Type.STRING },
                  estimatedMonthlyTotal: { type: Type.STRING },
                  savingAction: { 
                    type: Type.STRING,
                    enum: ['Prioritas', 'Kurangi', 'Stop Sementara']
                  }
                },
                required: ['category', 'dailyAllocation', 'estimatedMonthlyTotal', 'savingAction']
              }
            }
          },
          required: ['status', 'summary', 'dailyAdvice', 'tableRecommendations'],
        },
      },
    });

    const resultText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(resultText);
  } catch (error) {
    console.error('❌ Error Gemini Advisor:', error);
    throw new Error('Gagal menghasilkan analisis AI Advisor: ' + error.message);
  }
};

module.exports = {
  extractReceiptWithGemini,
  generateBudgetAdvisorWithGemini,
};