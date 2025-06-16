import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

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
  "澎湖縣",
  "連江縣",
  "金門縣",
];

const cityNumbering = cityList.reduce((acc, city, index) => {
  acc[String(index + 1)] = city;
  return acc;
}, {});

async function getData() {
  const response = await fetch("https://www.dgpa.gov.tw/typh/daily/nds.html");
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // 解析更新時間
  const updateTimeElement = document.querySelector("h4");
  let rawUpdateTime = "2024/09/30 18:52:14"; // 預設
  if (updateTimeElement) {
    const timeText = updateTimeElement.textContent.trim();
    const timeMatch = timeText.match(
      /更新時間：(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/
    );
    if (timeMatch) {
      rawUpdateTime = timeMatch[1];
    }
  }

  // 檢查是否存在「無停班停課訊息。」
  const noClosureInfo = document.body.textContent.includes("無停班停課訊息。");
  if (noClosureInfo) {
    const allNormalInfo = "照常上班，照常上課。";

    // 这里返回的结构要和下面的返回结构一致
    return { data: allNormalInfo, updateTime: rawUpdateTime };
  }

  // 如果沒有關鍵字，解析表格資料
  const table = document.getElementById("Table");
  const rows = table.getElementsByTagName("tr");
  const typhoonInfo = {};

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    if (cells.length >= 2) {
      const city = cells[0].textContent.trim();
      const status = cells[1].textContent.trim();
      const statusParts = status.split("  ").map((part) => part.trim());
      typhoonInfo[city] = [...statusParts];
    }
  }

  return { data: typhoonInfo, updateTime: rawUpdateTime };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const cityNumber = searchParams.get("city");
  const city = cityNumbering[cityNumber];
  const { data, updateTime } = await getData(); // 注意这里的数据结构变化

  // 如果没有城市信息，返回普通信息
  if (data === "照常上班，照常上課。") {
    return NextResponse.json({
      data,
      updateTime,
    });
  }

  // 处理城市信息
  if (city && data[city]) {
    return NextResponse.json({
      data: data[city],
      updateTime,
    });
  } else {
    return NextResponse.json(
      { error: "找不到城市或沒有資料可用" },
      { status: 404 }
    );
  }
}
