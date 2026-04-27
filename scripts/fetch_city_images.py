#!/usr/bin/env python3
"""Fetch lead image for each city from Chinese Wikipedia, with license metadata."""

import json
import os
import sys
import time
import urllib.parse
import urllib.request

# city_id -> Wikipedia article title (zh)
CITY_TITLES = {
    "beijing": "北京市",
    "harbin": "哈尔滨市",
    "hulunbuir": "呼伦贝尔市",
    "changbaishan": "长白山",
    "pingyao": "平遥古城",
    "jinan": "济南市",
    "qingdao": "青岛市",
    "kaifeng": "开封市",
    "luoyang": "洛阳市",
    "lanzhou": "兰州市",
    "dunhuang": "敦煌市",
    "kashi": "喀什市",
    "xian": "西安市",
    "yangzhou": "扬州市",
    "nanjing": "南京市",
    "yixing": "宜兴市",
    "suzhou": "苏州市",
    "shanghai": "上海市",
    "hangzhou": "杭州市",
    "shaoxing": "绍兴市",
    "huangshan": "黄山市",
    "jingdezhen": "景德镇市",
    "wuhan": "武汉市",
    "changsha": "长沙市",
    "zhangjiajie": "张家界市",
    "fuzhou": "福州市",
    "quanzhou": "泉州市",
    "xiamen": "厦门市",
    "chaozhou": "潮州市",
    "guangzhou": "广州市",
    "foshan": "佛山市",
    "chengdu": "成都市",
    "jiuzhaigou": "九寨沟",
    "leshan": "乐山市",
    "chongqing": "重庆市",
    "guiyang": "贵阳市",
    "guilin": "桂林市",
    "nanning": "南宁市",
    "kunming": "昆明市",
    "dali": "大理市",
    "lijiang": "丽江市",
    "xishuangbanna": "西双版纳傣族自治州",
    "lasa": "拉萨市",
    "sanya": "三亚市",
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "web", "img", "cities")
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


def get_page_image(title, size_px=800):
    """Use the MediaWiki pageimages API which pre-generates working thumbnail URLs."""
    enc = urllib.parse.quote(title, safe="")
    url = (
        "https://zh.wikipedia.org/w/api.php"
        f"?action=query&titles={enc}"
        f"&prop=pageimages&pithumbsize={size_px}&format=json"
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
    """Get license + author for a Commons file."""
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


def parse_filename_from_url(url):
    # https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Skyline_of_Beijing....jpg/3840px-...
    parts = url.split("/")
    if "thumb" in parts:
        i = parts.index("thumb")
        return urllib.parse.unquote(parts[i + 3])
    return urllib.parse.unquote(parts[-1])


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
    for cid, title in CITY_TITLES.items():
        out_path = os.path.join(OUT_DIR, f"{cid}.jpg")
        if os.path.exists(out_path):
            print(f"[skip] {cid} already exists")
            continue
        try:
            print(f"[fetch] {cid} → {title}")
            page = get_page_image(title, size_px=900)
            if not page:
                print(f"  ! no image on page {title}")
                failed.append(cid)
                continue
            filename = page["filename"]
            info = get_image_info(filename) or {}
            meta = extract_meta(info.get("extmetadata", {}))
            img_bytes = http_bytes(page["thumb_url"])
            with open(out_path, "wb") as f:
                f.write(img_bytes)
            attribution[f"cities/{cid}.jpg"] = {
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
            failed.append(cid)
            time.sleep(1)

    with open(ATTR_PATH, "w") as f:
        json.dump(attribution, f, ensure_ascii=False, indent=2)
    print(f"\nDone. {len(attribution)} attributions saved. Failed: {failed}")


if __name__ == "__main__":
    main()
