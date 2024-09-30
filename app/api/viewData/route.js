import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

// 城市列表及其對應編號
const cityList = [
  "基隆市",
  "臺北市",
  "新北市",
  "桃園市",
  "新竹市",
  "新竹縣",
  "苗栗縣",
  "臺中市",
  "彰化縣",
  "雲林縣",
  "南投縣",
  "嘉義市",
  "嘉義縣",
  "臺南市",
  "高雄市",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "臺東縣",
  "蘭嶼鄉",
  "澎湖縣",
  "連江縣",
  "金門縣",
];

const cityNumbering = cityList.reduce((acc, city, index) => {
  acc[String(index + 1)] = city;
  return acc;
}, {});

async function getData() {
  console.log("開始獲取颱風數據...");
  try {
    const response = await fetch("https://www.dgpa.gov.tw/typh/daily/nds.html");
    if (!response.ok) {
      console.error(`無法獲取資料，HTTP 狀態碼: ${response.status}`);
      throw new Error(`獲取資料失敗: ${response.statusText}`);
    }
    const html = await response.text();
    console.log("成功獲取到資料，開始解析 HTML...");

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const table = document.getElementById("Table");
    if (!table) {
      console.error("找不到指定的表格元素，請檢查 HTML 結構。");
      throw new Error("找不到表格元素");
    }

    const rows = table.getElementsByTagName("tr");
    const typhoonInfo = {};

    for (let i = 1; i < rows.length; i++) {
      // 跳過表頭
      const cells = rows[i].getElementsByTagName("td");
      if (cells.length >= 2) {
        const city = cells[0].textContent.trim();
        const status = cells[1].textContent.trim();
        const statusParts = status.split("  ").map((part) => part.trim());

        if (typhoonInfo[city]) {
          typhoonInfo[city].push(...statusParts);
        } else {
          typhoonInfo[city] = [...statusParts];
        }
      } else {
        console.warn(`第 ${i + 1} 行缺少必要的資料。`);
      }
    }

    console.log("成功解析到颱風資訊。");
    return typhoonInfo;
  } catch (error) {
    console.error("獲取資料時發生錯誤:", error);
    throw new Error("獲取資料失敗");
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cityNumber = searchParams.get("city");

    if (!cityNumber) {
      console.error("缺少城市編號，請提供有效的城市編號。");
      return NextResponse.json({ error: "城市編號為必需" }, { status: 400 });
    }

    console.log(`收到請求，城市編號: ${cityNumber}`);
    const city = cityNumbering[cityNumber];
    const data = await getData();

    if (city && data[city]) {
      console.log(`找到城市 ${city} 的資料，返回結果...`);
      return NextResponse.json({ data: data[city] });
    } else {
      console.warn(`城市 ${city} 找不到或沒有可用資料。`);
      return NextResponse.json(
        { error: "找不到城市或沒有資料可用" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("GET /api/viewData 發生錯誤:", error);
    return NextResponse.json({ error: "內部伺服器錯誤" }, { status: 500 });
  }
}
