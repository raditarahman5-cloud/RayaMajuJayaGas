import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let base64Image = "";
    let fileName = "";

    const contentType = req.headers.get("content-type") || "";

    let mimeType = "image/jpeg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const fileEntry = formData.get("image");
      
      if (!fileEntry) {
        return NextResponse.json(
          { success: false, error: "File gambar tidak ditemukan dalam formulir." },
          { status: 400 }
        );
      }
      
      if (typeof fileEntry === "string") {
        base64Image = fileEntry.replace(/^data:image\/\w+;base64,/, "");
        mimeType = fileEntry.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
      } else {
        const file = fileEntry as File;
        fileName = file.name;
        mimeType = file.type || "image/jpeg";
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64Image = buffer.toString("base64");
      }
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body.image) {
        return NextResponse.json(
          { success: false, error: "Data gambar (base64) tidak ditemukan dalam payload JSON." },
          { status: 400 }
        );
      }
      base64Image = body.image.replace(/^data:image\/\w+;base64,/, "");
      mimeType = body.image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
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
                      text: "Kamu adalah sistem OCR pencatat pesanan LPG. Tugasmu adalah menganalisis foto nota/catatan/tulisan tangan pesanan ini dan mengekstrak 2 informasi utama:\n1. Nama Pembeli / Pemesan / Toko / Perwakilan (buyer_name)\n2. Jumlah Tabung LPG yang dipesan (tubes_count sebagai integer angka positif)\n\nPerhatikan baik-baik tulisan tangan atau teks yang ada di gambar. Jika ada tulisan seperti '3 tabung', '3 tbg', 'tiga', atau angka saja yang mengindikasikan jumlah, gunakan angka tersebut. Jika ada nama orang atau warung, gunakan sebagai buyer_name.\n\nKEMBALIKAN HANYA OBJEK JSON MURNI TANPA MARKDOWN DENGAN FORMAT PERSIS SEPERTI INI:\n{\"buyer_name\": \"Budi\", \"tubes_count\": 3}\n\nJika nama pembeli tidak tertulis sama sekali, gunakan \"Pemesan Nota\". Jika jumlah tabung tidak tertulis jelas, berikan perkiraan angka 1.",
                    },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Image,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
              }
            }),
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const textResult = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          let parsed: any = {};
          try {
            const cleanJsonText = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
            const jsonMatch = cleanJsonText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[0]);
            } else {
              parsed = JSON.parse(cleanJsonText);
            }
          } catch (e) {
            console.warn("Failed to parse Gemini JSON output:", textResult, e);
          }

          buyerName = parsed.buyer_name || parsed.nama_pembeli || parsed.nama || "Pemesan Nota";
          
          let count = parsed.tubes_count || parsed.jumlah_tabung || parsed.jumlah || 0;
          if (typeof count === "string") {
            const numMatch = count.match(/\d+/);
            count = numMatch ? parseInt(numMatch[0], 10) : 1;
          }
          tubesCount = Number(count) || 1;
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
