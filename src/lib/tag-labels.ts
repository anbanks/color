// Slugs stay English (URL stable). Display labels translate per locale.

export const TAG_SLUGS = [
  "Pastel", "Vintage", "Retro", "Neon", "Gold", "Light", "Dark",
  "Warm", "Cold", "Summer", "Fall", "Winter", "Spring", "Happy",
  "Nature", "Earth", "Night", "Space", "Rainbow", "Gradient",
  "Sunset", "Sky", "Sea", "Kids", "Skin", "Food", "Cream",
  "Coffee", "Wedding", "Christmas", "Halloween",
] as const;

export const COLOR_SLUGS = [
  "Blue", "Teal", "Mint", "Green", "Sage", "Yellow", "Beige",
  "Brown", "Orange", "Peach", "Red", "Maroon", "Pink", "Purple",
  "Navy", "Black", "Grey", "White",
] as const;

export type TagSlug = (typeof TAG_SLUGS)[number];
export type ColorSlug = (typeof COLOR_SLUGS)[number];

const tagLabelsByLocale: Record<string, Record<string, string>> = {
  en: Object.fromEntries(TAG_SLUGS.map((t) => [t, t])),
  pt: {
    Pastel: "Pastel", Vintage: "Vintage", Retro: "Retrô", Neon: "Neon",
    Gold: "Dourado", Light: "Claro", Dark: "Escuro", Warm: "Quente",
    Cold: "Frio", Summer: "Verão", Fall: "Outono", Winter: "Inverno",
    Spring: "Primavera", Happy: "Feliz", Nature: "Natureza", Earth: "Terra",
    Night: "Noite", Space: "Espaço", Rainbow: "Arco-íris", Gradient: "Gradiente",
    Sunset: "Pôr do sol", Sky: "Céu", Sea: "Mar", Kids: "Infantil",
    Skin: "Pele", Food: "Comida", Cream: "Creme", Coffee: "Café",
    Wedding: "Casamento", Christmas: "Natal", Halloween: "Halloween",
  },
  es: {
    Pastel: "Pastel", Vintage: "Vintage", Retro: "Retro", Neon: "Neón",
    Gold: "Dorado", Light: "Claro", Dark: "Oscuro", Warm: "Cálido",
    Cold: "Frío", Summer: "Verano", Fall: "Otoño", Winter: "Invierno",
    Spring: "Primavera", Happy: "Feliz", Nature: "Naturaleza", Earth: "Tierra",
    Night: "Noche", Space: "Espacio", Rainbow: "Arcoíris", Gradient: "Degradado",
    Sunset: "Atardecer", Sky: "Cielo", Sea: "Mar", Kids: "Infantil",
    Skin: "Piel", Food: "Comida", Cream: "Crema", Coffee: "Café",
    Wedding: "Boda", Christmas: "Navidad", Halloween: "Halloween",
  },
  fr: {
    Pastel: "Pastel", Vintage: "Vintage", Retro: "Rétro", Neon: "Néon",
    Gold: "Or", Light: "Clair", Dark: "Sombre", Warm: "Chaud",
    Cold: "Froid", Summer: "Été", Fall: "Automne", Winter: "Hiver",
    Spring: "Printemps", Happy: "Joyeux", Nature: "Nature", Earth: "Terre",
    Night: "Nuit", Space: "Espace", Rainbow: "Arc-en-ciel", Gradient: "Dégradé",
    Sunset: "Coucher de soleil", Sky: "Ciel", Sea: "Mer", Kids: "Enfants",
    Skin: "Peau", Food: "Cuisine", Cream: "Crème", Coffee: "Café",
    Wedding: "Mariage", Christmas: "Noël", Halloween: "Halloween",
  },
  de: {
    Pastel: "Pastell", Vintage: "Vintage", Retro: "Retro", Neon: "Neon",
    Gold: "Gold", Light: "Hell", Dark: "Dunkel", Warm: "Warm",
    Cold: "Kalt", Summer: "Sommer", Fall: "Herbst", Winter: "Winter",
    Spring: "Frühling", Happy: "Fröhlich", Nature: "Natur", Earth: "Erde",
    Night: "Nacht", Space: "Weltraum", Rainbow: "Regenbogen", Gradient: "Verlauf",
    Sunset: "Sonnenuntergang", Sky: "Himmel", Sea: "Meer", Kids: "Kinder",
    Skin: "Haut", Food: "Essen", Cream: "Creme", Coffee: "Kaffee",
    Wedding: "Hochzeit", Christmas: "Weihnachten", Halloween: "Halloween",
  },
  it: {
    Pastel: "Pastello", Vintage: "Vintage", Retro: "Retrò", Neon: "Neon",
    Gold: "Oro", Light: "Chiaro", Dark: "Scuro", Warm: "Caldo",
    Cold: "Freddo", Summer: "Estate", Fall: "Autunno", Winter: "Inverno",
    Spring: "Primavera", Happy: "Felice", Nature: "Natura", Earth: "Terra",
    Night: "Notte", Space: "Spazio", Rainbow: "Arcobaleno", Gradient: "Gradiente",
    Sunset: "Tramonto", Sky: "Cielo", Sea: "Mare", Kids: "Bambini",
    Skin: "Pelle", Food: "Cibo", Cream: "Crema", Coffee: "Caffè",
    Wedding: "Matrimonio", Christmas: "Natale", Halloween: "Halloween",
  },
  ja: {
    Pastel: "パステル", Vintage: "ヴィンテージ", Retro: "レトロ", Neon: "ネオン",
    Gold: "ゴールド", Light: "ライト", Dark: "ダーク", Warm: "暖色",
    Cold: "寒色", Summer: "夏", Fall: "秋", Winter: "冬",
    Spring: "春", Happy: "ハッピー", Nature: "自然", Earth: "大地",
    Night: "夜", Space: "宇宙", Rainbow: "虹", Gradient: "グラデーション",
    Sunset: "夕焼け", Sky: "空", Sea: "海", Kids: "キッズ",
    Skin: "肌色", Food: "フード", Cream: "クリーム", Coffee: "コーヒー",
    Wedding: "ウェディング", Christmas: "クリスマス", Halloween: "ハロウィン",
  },
  zh: {
    Pastel: "粉彩", Vintage: "复古", Retro: "怀旧", Neon: "霓虹",
    Gold: "金色", Light: "浅色", Dark: "深色", Warm: "暖色",
    Cold: "冷色", Summer: "夏", Fall: "秋", Winter: "冬",
    Spring: "春", Happy: "快乐", Nature: "自然", Earth: "大地",
    Night: "夜晚", Space: "太空", Rainbow: "彩虹", Gradient: "渐变",
    Sunset: "日落", Sky: "天空", Sea: "海洋", Kids: "儿童",
    Skin: "肤色", Food: "美食", Cream: "奶油", Coffee: "咖啡",
    Wedding: "婚礼", Christmas: "圣诞", Halloween: "万圣节",
  },
  hi: {
    Pastel: "पेस्टल", Vintage: "विंटेज", Retro: "रेट्रो", Neon: "नियॉन",
    Gold: "सुनहरा", Light: "हल्का", Dark: "गहरा", Warm: "गर्म",
    Cold: "ठंडा", Summer: "गर्मी", Fall: "पतझड़", Winter: "सर्दी",
    Spring: "वसंत", Happy: "खुश", Nature: "प्रकृति", Earth: "पृथ्वी",
    Night: "रात", Space: "अंतरिक्ष", Rainbow: "इंद्रधनुष", Gradient: "ग्रेडिएंट",
    Sunset: "सूर्यास्त", Sky: "आकाश", Sea: "समुद्र", Kids: "बच्चे",
    Skin: "त्वचा", Food: "भोजन", Cream: "क्रीम", Coffee: "कॉफी",
    Wedding: "शादी", Christmas: "क्रिसमस", Halloween: "हैलोवीन",
  },
};

const colorLabelsByLocale: Record<string, Record<string, string>> = {
  en: Object.fromEntries(COLOR_SLUGS.map((c) => [c, c])),
  pt: {
    Blue: "Azul", Teal: "Azul-petróleo", Mint: "Menta", Green: "Verde",
    Sage: "Sálvia", Yellow: "Amarelo", Beige: "Bege", Brown: "Marrom",
    Orange: "Laranja", Peach: "Pêssego", Red: "Vermelho", Maroon: "Bordô",
    Pink: "Rosa", Purple: "Roxo", Navy: "Azul-marinho", Black: "Preto",
    Grey: "Cinza", White: "Branco",
  },
  es: {
    Blue: "Azul", Teal: "Verde azulado", Mint: "Menta", Green: "Verde",
    Sage: "Salvia", Yellow: "Amarillo", Beige: "Beige", Brown: "Marrón",
    Orange: "Naranja", Peach: "Melocotón", Red: "Rojo", Maroon: "Granate",
    Pink: "Rosa", Purple: "Morado", Navy: "Azul marino", Black: "Negro",
    Grey: "Gris", White: "Blanco",
  },
  fr: {
    Blue: "Bleu", Teal: "Sarcelle", Mint: "Menthe", Green: "Vert",
    Sage: "Sauge", Yellow: "Jaune", Beige: "Beige", Brown: "Marron",
    Orange: "Orange", Peach: "Pêche", Red: "Rouge", Maroon: "Bordeaux",
    Pink: "Rose", Purple: "Violet", Navy: "Marine", Black: "Noir",
    Grey: "Gris", White: "Blanc",
  },
  de: {
    Blue: "Blau", Teal: "Türkis", Mint: "Minze", Green: "Grün",
    Sage: "Salbei", Yellow: "Gelb", Beige: "Beige", Brown: "Braun",
    Orange: "Orange", Peach: "Pfirsich", Red: "Rot", Maroon: "Bordeaux",
    Pink: "Rosa", Purple: "Lila", Navy: "Marineblau", Black: "Schwarz",
    Grey: "Grau", White: "Weiß",
  },
  it: {
    Blue: "Blu", Teal: "Verde acqua", Mint: "Menta", Green: "Verde",
    Sage: "Salvia", Yellow: "Giallo", Beige: "Beige", Brown: "Marrone",
    Orange: "Arancione", Peach: "Pesca", Red: "Rosso", Maroon: "Bordeaux",
    Pink: "Rosa", Purple: "Viola", Navy: "Blu navy", Black: "Nero",
    Grey: "Grigio", White: "Bianco",
  },
  ja: {
    Blue: "ブルー", Teal: "ティール", Mint: "ミント", Green: "グリーン",
    Sage: "セージ", Yellow: "イエロー", Beige: "ベージュ", Brown: "ブラウン",
    Orange: "オレンジ", Peach: "ピーチ", Red: "レッド", Maroon: "マルーン",
    Pink: "ピンク", Purple: "パープル", Navy: "ネイビー", Black: "ブラック",
    Grey: "グレー", White: "ホワイト",
  },
  zh: {
    Blue: "蓝色", Teal: "青色", Mint: "薄荷", Green: "绿色",
    Sage: "鼠尾草", Yellow: "黄色", Beige: "米色", Brown: "棕色",
    Orange: "橙色", Peach: "桃色", Red: "红色", Maroon: "栗色",
    Pink: "粉色", Purple: "紫色", Navy: "藏青", Black: "黑色",
    Grey: "灰色", White: "白色",
  },
  hi: {
    Blue: "नीला", Teal: "टील", Mint: "मिंट", Green: "हरा",
    Sage: "सेज", Yellow: "पीला", Beige: "बेज", Brown: "भूरा",
    Orange: "नारंगी", Peach: "पीच", Red: "लाल", Maroon: "मरून",
    Pink: "गुलाबी", Purple: "बैंगनी", Navy: "नेवी", Black: "काला",
    Grey: "ग्रे", White: "सफेद",
  },
};

export function tagLabel(slug: string, locale: string): string {
  return tagLabelsByLocale[locale]?.[slug] ?? tagLabelsByLocale.en[slug] ?? slug;
}

export function colorLabel(slug: string, locale: string): string {
  return (
    colorLabelsByLocale[locale]?.[slug] ?? colorLabelsByLocale.en[slug] ?? slug
  );
}
