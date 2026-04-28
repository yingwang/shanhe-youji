#!/usr/bin/env python3
"""Fetch lead image for each scenic spot from Chinese Wikipedia, with license metadata."""

import json
import os
import time
import urllib.parse
import urllib.request

SCENIC_TITLES = {
    "s1": "故宫",
    "s2": "八达岭长城",
    "s3": "颐和园",
    "s4": "哈尔滨冰雪大世界",
    "s5": "哈尔滨圣索菲亚教堂",
    "s6": "外滩",
    "s7": "朱家角",
    "s8": "中山陵",
    "s9": "南京夫子庙",
    "s10": "拙政园",
    "s11": "虎丘",
    "s12": "平江历史街区",
    "s13": "西湖",
    "s14": "灵隐寺",
    "s15": "宜兴市",
    "s16": "景德镇古窑民俗博览区",
    "s17": "御窑厂",
    "s18": "黄山",
    "s19": "宏村",
    "s20": "黄鹤楼",
    "s21": "东湖 (武汉)",
    "s22": "岳麓山",
    "s23": "马王堆汉墓",
    "s24": "陈家祠",
    "s25": "白云山 (广州)",
    "s26": "广济桥 (潮州)",
    "s27": "牌坊街",
    "s28": "鼓浪屿",
    "s29": "南普陀寺",
    "s30": "三坊七巷",
    "s31": "开元寺 (泉州)",
    "s32": "清源山风景名胜区",
    "s33": "漓江",
    "s34": "阳朔西街",
    "s35": "秦始皇兵马俑",
    "s36": "大雁塔",
    "s37": "回民街",
    "s38": "莫高窟",
    "s39": "月牙泉",
    "s40": "龙门石窟",
    "s41": "白马寺",
    "s42": "都江堰",
    "s43": "宽窄巷子",
    "s44": "成都武侯祠",
    "s45": "大足石刻",
    "s46": "洪崖洞",
    "s47": "路南石林",
    "s48": "滇池",
    "s49": "崇圣寺三塔",
    "s50": "洱海",
    "s51": "布达拉宫",
    "s52": "大昭寺",
    "s53": "清明上河图",
    "s54": "开封铁塔",
    "s55": "趵突泉",
    "s56": "大明湖",
    "s57": "青岛栈桥",
    "s58": "崂山",
    "s59": "瘦西湖",
    "s60": "个园",
    "s61": "鲁迅故里",
    "s62": "兰亭集序",
    "s63": "黄果树瀑布",
    "s64": "青岩古镇",
    "s65": "丽江古城",
    "s66": "玉龙雪山",
    "s67": "中国科学院西双版纳热带植物园",
    "s68": "亚洲象",
    "s69": "张家界国家森林公园",
    "s70": "天门山国家森林公园",
    "s71": "九寨沟",
    "s72": "乐山大佛",
    "s73": "峨眉山",
    "s74": "天涯海角",
    "s75": "南山寺 (三亚)",
    "s76": "蜈支洲岛",
    "s77": "中山桥 (兰州)",
    "s78": "甘肃省博物馆",
    "s79": "青秀山",
    "s80": "德天瀑布",
    "s81": "长白山天池",
    "s82": "呼伦贝尔",
    "s83": "满洲里市",
    "s84": "喀什噶尔老城",
    "s85": "艾提尕尔清真寺",
    "s86": "佛山祖庙",
    "s87": "南风古灶",
    "s88": "平遥古城",
    "s89": "日升昌",
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "web", "img", "scenics")
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
    for sid, title in SCENIC_TITLES.items():
        out_path = os.path.join(OUT_DIR, f"{sid}.jpg")
        if os.path.exists(out_path):
            print(f"[skip] {sid} already exists")
            continue
        try:
            print(f"[fetch] {sid} → {title}")
            page = get_page_image(title, size_px=900)
            if not page:
                print(f"  ! no image on page {title}")
                failed.append(sid)
                continue
            filename = page["filename"]
            info = get_image_info(filename) or {}
            meta = extract_meta(info.get("extmetadata", {}))
            img_bytes = http_bytes(page["thumb_url"])
            with open(out_path, "wb") as f:
                f.write(img_bytes)
            attribution[f"scenics/{sid}.jpg"] = {
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
            failed.append(sid)
            time.sleep(1)

    with open(ATTR_PATH, "w") as f:
        json.dump(attribution, f, ensure_ascii=False, indent=2)
    print(f"\nDone. {len(attribution)} attributions saved. Failed: {failed}")


if __name__ == "__main__":
    main()
