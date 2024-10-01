// app/api/getCityByLocation/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // 檢查經緯度是否存在
  if (!lat || !lon) {
    return new Response(
      JSON.stringify({ error: "Latitude and longitude are required" }),
      { status: 400 }
    );
  }

  // Nominatim 地理編碼 URL
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

  try {
    // 發送請求取得 JSON
    const response = await fetch(url);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "City not found" }), {
        status: 404,
      });
    }
    const data = await response.json();

    // 提取縣市名稱
    const city = data.address.city || data.address.town || data.address.village;

    if (!city) {
      return new Response(JSON.stringify({ error: "City not found" }), {
        status: 404,
      });
    }

    // 回報縣市名稱
    return new Response(JSON.stringify({ cityName: city }), { status: 200 });
  } catch (error) {
    console.error("Error fetching city data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch city data" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { lat, lon } = await req.json();

  // 檢查經緯度是否存在
  if (!lat || !lon) {
    return new Response(
      JSON.stringify({ error: "Latitude and longitude are required" }),
      { status: 400 }
    );
  }

  // Nominatim 地理編碼 URL
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

  try {
    // 發送請求取得 JSON
    const response = await fetch(url);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "City not found" }), {
        status: 404,
      });
    }
    const data = await response.json();

    // 提取縣市名稱
    const city = data.address.city || data.address.town || data.address.village;

    if (!city) {
      return new Response(JSON.stringify({ error: "City not found" }), {
        status: 404,
      });
    }

    // 回報縣市名稱
    return new Response(JSON.stringify({ cityName: city }), { status: 200 });
  } catch (error) {
    console.error("Error fetching city data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch city data" }),
      { status: 500 }
    );
  }
}
