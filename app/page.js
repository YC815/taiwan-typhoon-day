"use client";
import { useState } from "react";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 縣市列表及其對應的數字
const cityList = [
  { value: "基隆市", label: "基隆市", number: 1 },
  { value: "臺北市", label: "臺北市", number: 2 },
  { value: "新北市", label: "新北市", number: 3 },
  { value: "桃園市", label: "桃園市", number: 4 },
  { value: "新竹市", label: "新竹市", number: 5 },
  { value: "新竹縣", label: "新竹縣", number: 6 },
  { value: "苗栗縣", label: "苗栗縣", number: 7 },
  { value: "臺中市", label: "臺中市", number: 8 },
  { value: "彰化縣", label: "彰化縣", number: 9 },
  { value: "雲林縣", label: "雲林縣", number: 10 },
  { value: "南投縣", label: "南投縣", number: 11 },
  { value: "嘉義市", label: "嘉義市", number: 12 },
  { value: "嘉義縣", label: "嘉義縣", number: 13 },
  { value: "臺南市", label: "臺南市", number: 14 },
  { value: "高雄市", label: "高雄市", number: 15 },
  { value: "屏東縣", label: "屏東縣", number: 16 },
  { value: "宜蘭縣", label: "宜蘭縣", number: 17 },
  { value: "花蓮縣", label: "花蓮縣", number: 18 },
  { value: "臺東縣", label: "臺東縣", number: 19 },
  { value: "蘭嶼鄉", label: "蘭嶼鄉", number: 20 },
  { value: "澎湖縣", label: "澎湖縣", number: 21 },
  { value: "連江縣", label: "連江縣", number: 22 },
  { value: "金門縣", label: "金門縣", number: 23 },
];

export default function Home() {
  const [cityNumber, setCityNumber] = useState(""); // 用於儲存數字
  const [data, setData] = useState(null);

  // 當下拉選單變化時更新 cityNumber
  const handleSelectChange = (value) => {
    // 尋找選擇的城市並更新 cityNumber 為其對應的數字
    const selectedCity = cityList.find((city) => city.value === value);
    setCityNumber(selectedCity ? selectedCity.number : "");
  };

  const handleSubmit = async () => {
    if (!cityNumber) {
      // 如果沒有選擇縣市，顯示錯誤訊息
      window.console.error("請選擇一個縣市");
      return;
    }

    const response = await fetch(`/api/viewData?city=${cityNumber}`);
    const result = await response.json();
    setData(result);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-500 px-4">
      {" "}
      {/* 在這裡添加了 px-4 */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">颱風假查詢</h1>
        <Select onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="選擇縣市" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>縣市</SelectLabel>
              {cityList.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white rounded-lg px-4 py-2 mt-4"
        >
          查詢資料
        </button>

        {data && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">查詢結果</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              {Array.isArray(data.data) ? (
                data.data.map((message, index) => (
                  <div key={index} className="mb-2">
                    {message.includes("停止上班") ||
                    message.includes("停止上課") ? (
                      <div className="bg-yellow-400 p-2 rounded-lg text-black font-bold">
                        {message}
                      </div>
                    ) : (
                      <div>{message}</div>
                    )}
                  </div>
                ))
              ) : (
                <div>{data.data}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
