import json
from bs4 import BeautifulSoup
import requests
import os

# 城市列表及其對應編號
city_list = [
    "基隆市", "臺北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣", "臺中市", "彰化縣", "雲林縣",
    "南投縣", "嘉義市", "嘉義縣", "臺南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "臺東縣", "蘭嶼鄉",
    "澎湖縣", "連江縣", "金門縣"
]
city_numbering = {str(index + 1): city for index, city in enumerate(city_list)}


def GetData():
    r = requests.get("https://www.dgpa.gov.tw/typh/daily/nds.html")
    r.encoding = "utf-8"
    html = r.text

    # 使用 BeautifulSoup 解析 HTML
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", {"id": "Table"})
    rows = table.find_all("tr")[1:]  # 跳過表頭

    # 整理颱風資訊
    typhoon_info = {}

    for row in rows:
        cells = row.find_all('td')
        if len(cells) >= 2:  # 確保至少有兩個單元格
            city = cells[0].text.strip()
            status = cells[1].text.strip()

            # 將 status 中的雙空格分割為多段
            status_parts = status.split("  ")  # 以兩個空格進行分割

            # 如果城市已經存在於字典中，則將新內容加入到現有的 status 列表中
            if city in typhoon_info:
                typhoon_info[city].extend([part.strip() for part in status_parts])
            else:
                # 若該城市不存在，則新增一個帶有 status 列表的項目
                typhoon_info[city] = [part.strip() for part in status_parts]

    return typhoon_info


def ViewData(city_number):
    city = city_numbering.get(str(city_number), None)

    if city:
        data = GetData()
        if city in data:
            for status in data[city]:
                return status
        else:
            return "Not Found"
    else:
        return "Error: Invalid city number"


'''
1基隆市
2臺北市
3新北市
4桃園市
5新竹市
6新竹縣
7苗栗縣
8臺中市
9彰化縣
10雲林縣
11南投縣
12嘉義市
13嘉義縣
14臺南市
15高雄市
16屏東縣
17宜蘭縣
18花蓮縣
19臺東縣
20蘭嶼鄉
21澎湖縣
22連江縣
23金門縣
'''
