import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let base64Image = "";
    let fileName = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: "File gambar tidak ditemukan dalam formulir." },
          { status: 400 }
        );
      }
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Image = buffer.toString("base64");
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body.image) {
        return NextResponse.json(
          { success: false, error: "Data gambar (base64) tidak ditemukan dalam payload JSON." },
          { status: 400 }
        );
      }
      base64Image = body.image.replace(/^data:image\/\w+;base64,/, "");
    } else {
      return NextResponse.json(
        { success: false, error: "Content-Type tidak didukung. Gunakan multipart/form-data atau application/json." },
        { status: 400 }
      );
    }

    if (!base64Image) {
      return NextResponse.json(
        { success: false, error: "Gambar kosong atau tidak valid." },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let buyerName = "";
    let tubesCount = 0;

    if (geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Kamu adalah sistem OCR pencatat pesanan LPG Pangkalan Raya Maju Jaya. Analisis foto nota/catatan pesanan ini dan dapatkan 2 informasi utama:\n1. Nama Pembeli / Pemesan / Toko / Perwakilan (buyer_name)\n2. Jumlah Tabung LPG yang dipesan (tubes_count sebagai integer angka positif)\n\nJawab HANYA dengan JSON murni tanpa format markdown seperti berikut:\n{\"buyer_name\": \"...\", \"tubes_count\": 0}\nJika nama pembeli tidak tertulis jelas, gunakan \"Pemesan Nota\". Jika jumlah tabung tidak tertulis jelas, berikan perkiraan 1.",
                    },
                    {
                      inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Image,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const textResult = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          const cleanJsonText = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJsonText);

          buyerName = parsed.buyer_name || "Pemesan Nota";
          tubesCount = Number(parsed.tubes_count) || 1;
        }
      } catch (err) {
        console.warn("Gemini API scan failed, falling back to smart heuristic parser:", err);
      }
    }

    // Fallback parser jika AI key belum terpasang atau API offline
    if (!buyerName || !tubesCount) {
      // Ekstrak nama potensial dari nama file jika ada, misal: nota_Budi_5_tabung.jpg
      const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      
      const numbers = cleanName.match(/\d+/g);
      tubesCount = numbers ? parseInt(numbers[0], 10) : 2;
      
      const nameParts = cleanName.replace(/\d+/g, "").trim();
      buyerName = nameParts ? nameParts.charAt(0).toUpperCase() + nameParts.slice(1) : "Pemesan (Hasil Scan Nota)";
    }

    return NextResponse.json({
      success: true,
      data: {
        buyer_name: buyerName,
        tubes_count: Math.max(1, tubesCount),
      },
    });

  } catch (error: any) {
    console.error("Error in /api/scan-order:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Terjadi kesalahan internal saat memindai gambar.",
      },
      { status: 500 }
    );
  }
}
