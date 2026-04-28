#!/usr/bin/env python3
"""Fetch lead image for each treasure card from Chinese Wikipedia."""

import json
import os
import time
import urllib.parse
import urllib.request

TREASURE_TITLES = {
    "t1": "景泰蓝",
    "t2": "京剧脸谱",
    "t3": "冰雕",
    "t4": "旗袍",
    "t5": "云锦",
    "t6": "苏绣",
    "t7": "苏扇",
    "t8": "龙泉青瓷",
    "t9": "宜兴紫砂壶",
    "t10": "景德镇瓷器",
    "t11": "徽墨",
    "t12": "汉绣",
    "t13": "湘绣",
    "t14": "广彩瓷",
    "t15": "广绣",
    "t16": "潮绣",
    "t17": "漆线雕",
    "t18": "寿山石",
    "t19": "提线木偶",
    "t20": "南音",
    "t21": "壮锦",
    "t22": "皮影戏",
    "t23": "敦煌壁画",
    "t24": "唐三彩",
    "t25": "蜀锦",
    "t26": "荣昌陶器",
    "t27": "建水紫陶",
    "t28": "白族扎染",
    "t29": "唐卡",
    "t30": "汴绣",
    "t31": "龙山黑陶",
    "t32": "贝雕",
    "t33": "扬州漆器",
    "t34": "越剧",
    "t35": "苗族银饰",
    "t36": "蜡染",
    "t37": "东巴文",
    "t38": "傣锦",
    "t39": "西兰卡普",
    "t40": "羌绣",
    "t41": "夹江年画",
    "t42": "黎锦",
    "t43": "马踏飞燕",
    "t44": "坭兴陶",
    "t45": "朝鲜族长鼓舞",
    "t46": "马头琴",
    "t47": "和田玉",
    "t48": "木卡姆",
    "t49": "佛山剪纸",
    "t50": "石湾陶塑",
    "t51": "平遥推光漆器",
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "web", "img", "treasures")
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
    for tid, title in TREASURE_TITLES.items():
        out_path = os.path.join(OUT_DIR, f"{tid}.jpg")
        if os.path.exists(out_path):
            print(f"[skip] {tid} already exists")
            continue
        try:
            print(f"[fetch] {tid} → {title}")
            page = get_page_image(title, size_px=900)
            if not page:
                print(f"  ! no image on page {title}")
                failed.append(tid)
                continue
            filename = page["filename"]
            info = get_image_info(filename) or {}
            meta = extract_meta(info.get("extmetadata", {}))
            img_bytes = http_bytes(page["thumb_url"])
            with open(out_path, "wb") as f:
                f.write(img_bytes)
            attribution[f"treasures/{tid}.jpg"] = {
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
            failed.append(tid)
            time.sleep(1)

    with open(ATTR_PATH, "w") as f:
        json.dump(attribution, f, ensure_ascii=False, indent=2)
    print(f"\nDone. {len(attribution)} attributions saved. Failed: {failed}")


if __name__ == "__main__":
    main()
