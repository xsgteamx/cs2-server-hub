(() => {
  const MAP_URL = "./data/generated/skin_rarity_map.zh-CN.json?v=1";

  const DEFAULT_RARITY = {
    id: "default",
    name: "普通",
    color: "#d6d6d6"
  };

  const KNIFE_RARITY = {
    id: "rare_special",
    name: "稀有特殊物品",
    color: "#e4ae39"
  };

  function getRarityByValue(value, map) {
    if (!value) return DEFAULT_RARITY;

    if (value.startsWith("knife-")) {
      return map.special?.knife || KNIFE_RARITY;
    }

    return map.items?.[value]?.rarity || DEFAULT_RARITY;
  }

  function getCardFromSelect(select) {
    return select.closest(".card");
  }

  function ensureRarityPill(card) {
    const header = card.querySelector(".card-header");
    if (!header) return null;

    let pill = header.querySelector(".rarity-pill");
    if (!pill) {
      pill = document.createElement("span");
      pill.className = "rarity-pill";
      header.appendChild(pill);
    }

    return pill;
  }

  function setImportantStyle(el, prop, value) {
    el.style.setProperty(prop, value, "important");
  }

  function applyCardRarity(card, rarity) {
    if (!card || !rarity) return;

    const color = rarity.color || DEFAULT_RARITY.color;

    card.dataset.rarity = rarity.id || "unknown";
    card.style.setProperty("--rarity-color", color);

    const names = card.querySelectorAll(".card-header .item-name, .card-header .card-title");
    names.forEach((el) => {
      setImportantStyle(el, "color", color);
    });

    const pill = ensureRarityPill(card);
    if (pill) {
      pill.textContent = rarity.name || "未知稀有度";
      setImportantStyle(pill, "border-color", color);
      setImportantStyle(pill, "color", color);
    }
  }

  function applySelectRarity(select, rarity) {
    const color = rarity.color || DEFAULT_RARITY.color;

    select.dataset.rarity = rarity.id || "unknown";
    select.style.setProperty("--rarity-color", color);

    setImportantStyle(select, "color", color);
    setImportantStyle(select, "border-color", color);
    setImportantStyle(select, "box-shadow", `inset 0 0 0 1px ${color}33`);
  }

  function applyOptionColors(select, map) {
    Array.from(select.options).forEach((option) => {
      const value = option.value;
      const rarity = getRarityByValue(value, map);
      const color = rarity.color || DEFAULT_RARITY.color;

      option.dataset.rarity = rarity.id || "unknown";
      option.dataset.rarityName = rarity.name || "普通";

      setImportantStyle(option, "color", color);
      setImportantStyle(option, "background-color", "#10131b");
      setImportantStyle(option, "font-weight", "900");
    });
  }

  function applyOneSelect(select, map) {
    const card = getCardFromSelect(select);
    const rarity = getRarityByValue(select.value, map);

    applyCardRarity(card, rarity);
    applySelectRarity(select, rarity);
    applyOptionColors(select, map);
  }

  function applyAll(map) {
    const selects = document.querySelectorAll('select[name="forma"]');

    selects.forEach((select) => {
      applyOneSelect(select, map);

      select.addEventListener("change", () => {
        applyOneSelect(select, map);
      });
    });
  }

  fetch(MAP_URL, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((map) => {
      applyAll(map);
    })
    .catch((err) => {
      console.warn("[rarity] load failed:", err);
    });
})();
