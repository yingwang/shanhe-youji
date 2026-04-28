#!/usr/bin/env python3
"""Fetch lead image for each food card from Chinese Wikipedia."""

import json
import os
import time
import urllib.parse
import urllib.request

# Most foods can use their dish name directly as wiki title; a few need disambiguation
FOOD_TITLES = {
    "f1": "北京烤鸭",
    "f2": "炸酱面",
    "f3": "豆汁",
    "f4": "涮羊肉",
    "f5": "锅包肉",
    "f6": "铁锅炖",
    "f7": "马迭尔冰棍",
    "f8": "哈尔滨红肠",
    "f9": "生煎馒头",
    "f10": "小笼包",
    "f11": "红烧肉",
    "f12": "蟹壳黄",
    "f13": "盐水鸭",
    "f14": "鸭血粉丝汤",
    "f15": "小煮面",
    "f16": "糖芋苗",
    "f17": "松鼠桂鱼",
    "f18": "苏式汤面",
    "f19": "鸡头米",
    "f20": "东坡肉",
    "f21": "龙井虾仁",
    "f22": "西湖醋鱼",
    "f23": "葱包桧",
    "f24": "阳羡茶",
    "f25": "乌饭",
    "f26": "叫化鸡",
    "f27": "碱水粑",
    "f28": "南昌米粉",
    "f29": "臭鳜鱼",
    "f30": "毛豆腐",
    "f31": "笋衣烧肉",
    "f32": "热干面",
    "f33": "三鲜豆皮",
    "f34": "武昌鱼",
    "f35": "排骨藕汤",
    "f36": "剁椒鱼头",
    "f37": "臭豆腐",
    "f38": "小炒黄牛肉",
    "f39": "糖油粑粑",
    "f40": "白切鸡",
    "f41": "虾饺",
    "f42": "煲仔饭",
    "f43": "肠粉",
    "f44": "双皮奶",
    "f45": "潮汕牛肉火锅",
    "f46": "潮州肠粉",
    "f47": "工夫茶",
    "f48": "蚝烙",
    "f49": "沙茶面",
    "f50": "土笋冻",
    "f51": "蚵仔煎",
    "f52": "佛跳墙",
    "f53": "福州鱼丸",
    "f54": "锅边糊",
    "f55": "面线糊",
    "f56": "姜母鸭",
    "f57": "润饼",
    "f58": "桂林米粉",
    "f59": "啤酒鱼",
    "f60": "恭城油茶",
    "f61": "肉夹馍",
    "f62": "羊肉泡馍",
    "f63": "凉皮",
    "f64": "Biangbiang面",
    "f65": "驴肉黄面",
    "f66": "杏皮水",
    "f67": "胡羊焖饼",
    "f68": "洛阳水席",
    "f69": "不翻汤",
    "f70": "浆面条",
    "f71": "麻婆豆腐",
    "f72": "担担面",
    "f73": "钟水饺",
    "f74": "双流老妈兔头",
    "f75": "甜水面",
    "f76": "重庆火锅",
    "f77": "重庆小面",
    "f78": "酸辣粉",
    "f79": "豆花",
    "f80": "过桥米线",
    "f81": "鲜花饼",
    "f82": "汽锅鸡",
    "f83": "饵块",
    "f84": "白族三道茶",
    "f85": "乳扇",
    "f86": "饵丝",
    "f87": "酥油茶",
    "f88": "糌粑",
    "f89": "牦牛肉干",
    "f90": "灌汤包",
    "f91": "桶子鸡",
    "f92": "炒凉粉",
    "f93": "糖醋鲤鱼",
    "f94": "九转大肠",
    "f95": "甜沫",
    "f96": "把子肉",
    "f97": "青岛大虾",
    "f98": "蛤蜊",
    "f99": "鲅鱼水饺",
    "f100": "崂山茶",
    "f101": "扬州炒饭",
    "f102": "大煮干丝",
    "f103": "蟹黄汤包",
    "f104": "三丁包",
    "f105": "绍兴酒",
    "f106": "茴香豆",
    "f107": "醉鸡",
    "f108": "酸汤鱼",
    "f109": "肠旺面",
    "f110": "丝娃娃",
    "f111": "蕺菜",
    "f112": "腊排骨",
    "f113": "鸡豆凉粉",
    "f114": "纳西烤鱼",
    "f115": "菠萝饭",
    "f116": "手抓饭",
    "f117": "竹筒饭",
    "f118": "三下锅",
    "f119": "葛根粉",
    "f120": "牦牛",
    "f121": "洋芋糍粑",
    "f122": "钵钵鸡",
    "f123": "豆腐脑",
    "f124": "翘脚牛肉",
    "f125": "文昌鸡",
    "f126": "清补凉",
    "f127": "椰子鸡",
    "f128": "抱罗粉",
    "f129": "兰州牛肉面",
    "f130": "灰豆子",
    "f131": "手抓羊肉",
    "f132": "老友粉",
    "f133": "柠檬鸭",
    "f134": "螺蛳粉",
    "f135": "冷面",
    "f136": "酱骨",
    "f137": "参鸡汤",
    "f138": "烤全羊",
    "f139": "手把肉",
    "f140": "奶皮子",
    "f141": "馕",
    "f142": "大盘鸡",
    "f143": "抓饭",
    "f144": "烤包子",
    "f145": "鱼生",
    "f146": "伦教糕",
    "f147": "顺德双皮奶",
    "f148": "平遥牛肉",
    "f149": "刀削面",
    "f150": "碗托",
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "web", "img", "foods")
ATTR_PATH = os.path.join(os.path.dirname(__file__), "..", "web", "img", "attribution.json")
USER_AGENT = "ShanheYouji/1.0 (educational; contact: ying@local) python-urllib"


def _request(url, timeout=30, retries=4):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    last_err = None
    for attempt in range(retries):
        try:
            return urllib.request.urlopen(req, timeout=timeout).read()
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 429:
                wait = 8 * (attempt + 1)
                print(f"  (429, wait {wait}s)")
                time.sleep(wait)
                continue
            raise
    raise last_err


def http_json(url):
    return json.loads(_request(url, timeout=20).decode("utf-8"))


def http_bytes(url):
    return _request(url, timeout=30)


def get_page_image(title, size_px=900):
    enc = urllib.parse.quote(title, safe="")
    url = (
        "https://zh.wikipedia.org/w/api.php"
        f"?action=query&titles={enc}"
        f"&prop=pageimages&pithumbsize={size_px}&format=json&redirects=1"
    )
    data = http_json(url)
    pages = data.get("query", {}).get("pages", {})
    for _, page in pages.items():
        thumb = page.get("thumbnail")
        filename = page.get("pageimage")
        if thumb and filename:
            return {"thumb_url": thumb["source"], "filename": filename}
    return None


def get_image_info(filename):
    enc_title = urllib.parse.quote(f"File:{filename}", safe=":")
    url = (
        "https://commons.wikimedia.org/w/api.php"
        f"?action=query&titles={enc_title}"
        "&prop=imageinfo&iiprop=extmetadata|url|size&format=json"
    )
    data = http_json(url)
    pages = data.get("query", {}).get("pages", {})
    for _, page in pages.items():
        infos = page.get("imageinfo", [])
        if infos:
            return infos[0]
    return None


def extract_meta(extmeta):
    def get(k):
        v = extmeta.get(k)
        if isinstance(v, dict):
            return v.get("value", "")
        return ""
    return {
        "license": get("LicenseShortName"),
        "license_url": get("LicenseUrl"),
        "artist": get("Artist"),
        "credit": get("Credit"),
        "title": get("ObjectName") or get("ImageDescription"),
    }


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    if os.path.exists(ATTR_PATH):
        with open(ATTR_PATH) as f:
            attribution = json.load(f)
    else:
        attribution = {}

    failed = []
    for fid, title in FOOD_TITLES.items():
        out_path = os.path.join(OUT_DIR, f"{fid}.jpg")
        if os.path.exists(out_path):
            print(f"[skip] {fid} already exists")
            continue
        try:
            print(f"[fetch] {fid} → {title}")
            page = get_page_image(title, size_px=900)
            if not page:
                print(f"  ! no image on page {title}")
                failed.append(fid)
                continue
            filename = page["filename"]
            info = get_image_info(filename) or {}
            meta = extract_meta(info.get("extmetadata", {}))
            img_bytes = http_bytes(page["thumb_url"])
            with open(out_path, "wb") as f:
                f.write(img_bytes)
            attribution[f"foods/{fid}.jpg"] = {
                "source_page": f"https://zh.wikipedia.org/wiki/{urllib.parse.quote(title)}",
                "file_page": f"https://commons.wikimedia.org/wiki/File:{urllib.parse.quote(filename)}",
                "license": meta["license"],
                "license_url": meta["license_url"],
                "artist": meta["artist"],
                "title": meta["title"],
            }
            print(f"  ok ({len(img_bytes)/1024:.0f} KB) license={meta['license']}")
            time.sleep(3.0)
        except Exception as e:
            print(f"  ! error: {e}")
            failed.append(fid)
            time.sleep(1)

    with open(ATTR_PATH, "w") as f:
        json.dump(attribution, f, ensure_ascii=False, indent=2)
    print(f"\nDone. {len(attribution)} attributions saved. Failed: {failed}")


if __name__ == "__main__":
    main()
