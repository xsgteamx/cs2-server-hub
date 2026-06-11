import json
import re
from pathlib import Path
from datetime import datetime

BASE = Path(__file__).resolve().parents[1]

SOURCE_SKINS = BASE / "data/skins_zh-CN.json"
SOURCE_INVENTORY = BASE / "data/generated/csgo_inventory_zh-CN.json"
OUT = BASE / "data/generated/skin_rarity_map.zh-CN.json"

DEFAULT_RARITY = {
    "id": "default",
    "name": "普通",
    "color": "#d6d6d6"
}

KNIFE_RARITY = {
    "id": "rare_special",
    "name": "稀有特殊物品",
    "color": "#e4ae39"
}

def safe_id(value):
    value = str(value or "unknown").lower()
    return re.sub(r"[^a-z0-9_-]+", "-", value).strip("-") or "unknown"

def normalize_color(value):
    if not value:
        return None
    value = str(value).strip()
    if not value:
        return None
    if not value.startswith("#"):
        value = "#" + value
    return value

skins = json.loads(SOURCE_SKINS.read_text(encoding="utf-8"))
inventory = json.loads(SOURCE_INVENTORY.read_text(encoding="utf-8"))

inventory_skins = inventory.get("skins", {})

items = {}
missing = []

for item in skins:
    weapon_defindex = str(item.get("weapon_defindex"))
    paint = str(item.get("paint", "0"))
    key = f"{weapon_defindex}-{paint}"

    rarity = dict(DEFAULT_RARITY)

    if paint != "0":
        inv_item = inventory_skins.get(weapon_defindex, {}).get(paint)

        if inv_item:
            inv_rarity = inv_item.get("rarity") or {}
            color = normalize_color(inv_rarity.get("color"))

            if color:
                rarity = {
                    "id": safe_id(inv_rarity.get("id") or inv_rarity.get("name")),
                    "name": inv_rarity.get("name") or "未知稀有度",
                    "color": color
                }
            else:
                missing.append(key)
        else:
            missing.append(key)

    items[key] = {
        "key": key,
        "weapon_defindex": int(weapon_defindex) if weapon_defindex.isdigit() else weapon_defindex,
        "paint": int(paint) if paint.isdigit() else paint,
        "paint_name": item.get("paint_name", ""),
        "weapon_name": item.get("weapon_name", ""),
        "image": item.get("image", ""),
        "rarity": rarity
    }

result = {
    "meta": {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "source_local": str(SOURCE_SKINS),
        "source_inventory": "ByMykel/CSGO-API inventory zh-CN",
        "total": len(items),
        "missing": len(missing)
    },
    "special": {
        "knife": KNIFE_RARITY,
        "default": DEFAULT_RARITY
    },
    "items": items,
    "missing_keys": missing[:200]
}

OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"生成完成: {OUT}")
print(f"总数: {len(items)}")
print(f"未匹配: {len(missing)}")
