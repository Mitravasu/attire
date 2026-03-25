import { InventoryItem } from "../models/inventory.js";

function makeSvgDataUrl(title: string, tone: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760">
      <rect width="600" height="760" rx="36" fill="${tone}" />
      <circle cx="300" cy="188" r="68" fill="rgba(255,255,255,0.4)" />
      <rect x="168" y="274" width="264" height="264" rx="36" fill="rgba(255,255,255,0.32)" />
      <text x="300" y="626" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="white">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const seedItems: Array<
  Pick<InventoryItem, "title" | "tags" | "color" | "type" | "status" | "favorite">
> = [
  { title: "Oxford Shirt", tags: ["white", "work"], color: "white", type: "top", status: "clean", favorite: true },
  { title: "Wool Coat", tags: ["winter", "outerwear"], color: "charcoal", type: "outerwear", status: "clean", favorite: false },
  { title: "Pleated Trousers", tags: ["tailored", "office"], color: "navy", type: "bottom", status: "clean", favorite: true },
  { title: "Canvas Sneakers", tags: ["casual", "travel"], color: "cream", type: "shoes", status: "laundry", favorite: false },
  { title: "Ribbed Tee", tags: ["weekend", "layering"], color: "sage", type: "top", status: "clean", favorite: false },
  { title: "Utility Jacket", tags: ["spring", "utility"], color: "olive", type: "outerwear", status: "clean", favorite: false },
  { title: "Wide Leg Jeans", tags: ["denim", "casual"], color: "indigo", type: "bottom", status: "archived", favorite: false },
  { title: "Chelsea Boots", tags: ["fall", "leather"], color: "black", type: "shoes", status: "clean", favorite: true },
  { title: "Silk Scarf", tags: ["accessory", "print"], color: "rust", type: "accessory", status: "clean", favorite: false },
  { title: "Linen Shirt", tags: ["summer", "lightweight"], color: "sand", type: "top", status: "clean", favorite: true },
  { title: "Merino Sweater", tags: ["knit", "cold"], color: "forest", type: "top", status: "laundry", favorite: false },
  { title: "Running Shorts", tags: ["active", "gym"], color: "slate", type: "bottom", status: "clean", favorite: false },
];

const tones = [
  "#5f8575",
  "#6b5d54",
  "#6f7f99",
  "#b78c5b",
  "#83997d",
  "#866f60",
  "#556a78",
  "#4f4f54",
  "#a06958",
  "#b9a17b",
  "#4f6d5d",
  "#7d8087",
];

export const mockInventory: InventoryItem[] = seedItems.map((item, index) => {
  const tone = tones[index % tones.length];
  const createdAt = new Date(2026, 0, index + 1).toISOString();
  const updatedAt = new Date(2026, 1, index + 8).toISOString();

  return {
    id: `item-${index + 1}`,
    ...item,
    frontImageUrl: makeSvgDataUrl(item.title, tone),
    backImageUrl: index % 2 === 0 ? makeSvgDataUrl(`${item.title} Back`, "#d2d6dc") : undefined,
    createdAt,
    updatedAt,
  };
});

