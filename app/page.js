"use client";
import { useState, useEffect, useCallback } from "react";
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
  { value: "澎湖縣", label: "澎湖縣", number: 20 },
  { value: "連江縣", label: "連江縣", number: 21 },
  { value: "金門縣", label: "金門縣", number: 22 },
];

export default function Home() {
  const [cityNumber, setCityNumber] = useState(0);
  const [data, setData] = useState(null);
  const [updateTime, setUpdateTime] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [showData, setShowData] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [selectedCity, setSelectedCity] = useState(""); // 預設選擇為空字串
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(true); // 新增 loading 狀態

  const [fixedLocationData, setFixedLocationData] = useState(null);
  const [fixedData, setFixedData] = useState(null);
  const [fixedUpdateTime, setFixedUpdateTime] = useState("");

  const fetchData = useCallback(async (number, isFixed = false) => {
    setLoading(true); // 開始載入時設置 loading 為 true
    if (number) {
      const response = await fetch(`/api/viewData?city=${number}`);
      const result = await response.json();
      const rawUpdateTime = result.updateTime || "2024/09/30 18:52:14";
      const formattedUpdateTime = formatUpdateTime(rawUpdateTime);

      if (isFixed) {
        setFixedUpdateTime(formattedUpdateTime);
        setFixedData(result);
      } else {
        setUpdateTime(formattedUpdateTime);
        setData(result);
      }
      setShowData(true);
      setLoading(false); // 資料載入完成後設置 loading 為 false
    }
  }, []);

  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            fetch(`/api/getCityByLocation?lat=${latitude}&lon=${longitude}`)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
              })
              .then((result) => {
                const matchedCity = cityList.find(
                  (city) => city.value === result.cityName
                );
                if (matchedCity) {
                  setCityNumber(matchedCity.number);
                  setSelectedCity(matchedCity.value);
                  fetchData(matchedCity.number);
                  setLocationData(result);
                  setHasLocation(true);
                } else {
                  console.log("找不到匹配的城市:", result.cityName);
                }
                setLocationLoaded(true);
              })
              .catch((error) => {
                console.error("Error fetching city data:", error);
                setLocationLoaded(true);
              });
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationLoaded(true);
            setHasLocation(false); // 設置未開啟定位
          }
        );
      } catch (error) {
        console.error("Error requesting location:", error);
        setLocationLoaded(true);
        setHasLocation(false); // 如果請求定位時出現錯誤，也設置未開啟定位
      }
    };

    checkLocationPermission();
  }, []);

  const handleSelectChange = (value) => {
    const selectedCity = cityList.find((city) => city.value === value);
    setCityNumber(selectedCity ? selectedCity.number : "");
    setSelectedCity(value);
    fetchData(selectedCity.number);
  };

  const formatUpdateTime = (rawTime) => {
    const date = new Date(rawTime);
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 載入中狀態
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-500 px-4">
        <div className="text-white text-xl">資料載入中...</div>
      </div>
    );
  }
  if (!hasLocation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-500 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col justify-between">
          <h1 className="text-2xl font-bold m-3 self-center">颱風假動態</h1>
          <p className="text-center mb-2">
            定位未開啟，請手動選擇縣市以查看颱風假動態。
          </p>
          <Select onValueChange={handleSelectChange} value={selectedCity}>
            <SelectTrigger className="w-[280px] mb-4">
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
          {/* 其餘的顯示邏輯保持不變 */}
        </div>
        {updateTime && (
          <span className="text-sm text-gray-800 mt-4 self-center">
            資料更新時間：{updateTime}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-500 px-4">
      {/* 主要內容 */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col justify-between mt-3">
        {/* 固定顯示當前位置的颱風假資料 */}
        <h1 className="text-2xl font-bold m-3 mb-5 self-center">颱風假動態</h1>
        {hasLocation && fixedLocationData && (
          <div>
            <h2 className="text-xl font-semibold">
              您目前為於 {fixedLocationData.cityName}
            </h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              {fixedData &&
              fixedData.data &&
              Array.isArray(fixedData.data) &&
              fixedData.data.length > 0 ? (
                fixedData.data.map((message, index) => (
                  <div key={index} className="mb-2">
                    {message.includes("尚未列入警戒區") ? (
                      <div className="bg-green-500 p-2 rounded-lg text-white font-bold">
                        今天照常上班、照常上課。
                      </div>
                    ) : message.includes("照常") ? (
                      <div className="bg-green-500 p-2 rounded-lg text-white font-bold">
                        {message}
                      </div>
                    ) : message.includes("停止上班") ||
                      message.includes("停止上課") ? (
                      <div className="bg-red-500 p-2 rounded-lg text-black font-bold">
                        {message}
                      </div>
                    ) : (
                      <div>{message}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-green-500 p-2 rounded-lg text-white font-bold">
                  明天照常上班、照常上課。
                </div>
              )}
              <div className="mt-2 text-sm text-gray-500">
                更新時間：{fixedUpdateTime}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 查詢其他縣市的颱風假資料 */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col justify-between mt-3">
        <h2 className="text-2xl font-bold m-3 mb-5 self-center">
          查詢其他縣市的颱風假
        </h2>
        <div className="mb-4">
          <Select
            onValueChange={handleSelectChange}
            defaultValue={selectedCity}
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇一個縣市" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>縣市列表</SelectLabel>
                {cityList.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {showData && data && (
          <div className="bg-gray-100 p-4 rounded-lg">
            {data.data && Array.isArray(data.data) && data.data.length > 0 ? (
              data.data.map((message, index) => (
                <div key={index} className="mb-2">
                  {message.includes("尚未列入警戒區") ? (
                    <div className="bg-green-500 p-2 rounded-lg text-white font-bold">
                      今天照常上班、照常上課。
                    </div>
                  ) : message.includes("照常") ? (
                    <div className="bg-green-500 p-2 rounded-lg text-white font-bold">
                      {message}
                    </div>
                  ) : message.includes("停止上班") ||
                    message.includes("停止上課") ? (
                    <div className="bg-red-500 p-2 rounded-lg text-black font-bold">
                      {message}
                    </div>
                  ) : (
                    <div>{message}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-green-500 p-2 rounded-lg text-white font-bold">
                明天照常上班、照常上課。
              </div>
            )}
            <div className="mt-2 text-sm text-gray-500">
              更新時間：{updateTime}
            </div>
          </div>
        )}
        <iframe
          className="w-full h-64 mt-5 rounded-lg"
          src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=6&overlay=wind&product=ecmwf&level=surface&lat=23.876&lon=121.055"
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );
}
