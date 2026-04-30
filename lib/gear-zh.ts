// Chinese translations for gear items, keyed by their English `name`.
// Add an entry here if you add a new gear item to lib/gear.ts.
//
// Tip: re-use existing entries — many gear items appear in multiple
// recommendation paths (Ten Essentials + multi-day base + ecosystem)
// and dedupe happens by the English name.

export interface GearZhEntry {
  name: string;
  why?: string;
}

export const GEAR_ZH: Record<string, GearZhEntry> = {
  // Day-hike base
  "Trail running shoes or light hikers":         { name: "越野跑鞋或轻量徒步鞋" },
  "Moisture-wicking shirt":                      { name: "排汗 T 恤" },
  "Hiking shorts or convertible pants":          { name: "徒步短裤或可拆卸长裤" },
  "Daypack (15–25L)":                            { name: "日间背包（15–25 升）" },
  "Water bottles (2–3L total capacity)":         { name: "水瓶（共 2–3 升容量）" },
  "High-calorie snacks (bars, trail mix, jerky)": { name: "高热量零食（能量棒 / 干果 / 肉干）" },
  "Lunch + extra meal":                          { name: "午餐 + 备份一餐" },

  // Multi-day base
  "Sturdy mid-cut hiking boots (broken in)":     { name: "中帮徒步靴（事先磨合好）" },
  "Camp shoes (sandals or running shoes)":       { name: "营地鞋（凉鞋或运动鞋）" },
  "Multi-day backpack (50–65L)":                 { name: "多日背包（50–65 升）" },
  "3-season tent or tarp shelter":               { name: "三季帐篷或天幕" },
  "Sleeping bag (rated to expected low + 10°F)": { name: "睡袋（额定温度比预计低温再低 5°C）" },
  "Sleeping pad (R-value matched to season)":    { name: "睡垫（R 值匹配季节）" },
  "Stove + fuel canister":                       { name: "炉头 + 气罐" },
  "Cookpot + spork":                             { name: "锅 + 叉勺" },
  "Lightweight bowl / mug":                      { name: "轻量碗 / 杯" },
  "Water filter or chemical treatment":          { name: "滤水器或净水药片" },
  "Bear canister or Ursack (where required)":    { name: "防熊罐或 Ursack（按要求）" },
  "Trekking poles":                              { name: "登山杖" },
  "Quick-dry towel":                             { name: "速干毛巾" },
  "Wag bag / trowel for human waste":            { name: "便便袋或小铲（人粪处理）" },

  // Thru-hike additions
  "Resupply strategy + maildrops": {
    name: "补给计划与邮寄包裹",
    why: "数周徒步必须提前规划补给点",
  },
  "Camp shoes (foam clogs)":                     { name: "营地鞋（EVA 泡沫鞋）" },
  "Two pairs trail runners (rotate)": {
    name: "两双越野跑鞋（轮换）",
    why: "长穿越每 400–500 英里就要换鞋",
  },
  "Lightweight rain shell":                      { name: "轻量雨壳" },
  "Down puffy jacket":                           { name: "羽绒服" },
  "Sleep clothes (dry, separate from hike clothes)": { name: "睡眠衣物（干燥，跟徒步衣物分开）" },
  "Lightweight battery pack (10000mAh+)":        { name: "轻量充电宝（10000mAh+）" },
  "Phone with offline maps (FarOut/Gaia)":       { name: "下好离线地图的手机（FarOut / Gaia）" },
  "Satellite messenger (Garmin inReach / Zoleo)": {
    name: "卫星通讯器（Garmin inReach / Zoleo）",
    why: "数日没有手机信号，紧急通讯必备",
  },
  "Bear canister (where required)":              { name: "防熊罐（按要求）" },
  "Ice axe + microspikes (early season Sierra/Cascades)": {
    name: "冰镐 + 冰爪（Sierra/Cascades 早季）",
    why: "高海拔山口积雪可延续到 7 月",
  },

  // Ten essentials
  "Topographic map":                             { name: "地形图" },
  "Compass or GPS":                              { name: "指南针或 GPS" },
  "Sun hat & sunglasses":                        { name: "防晒帽 & 太阳镜" },
  "SPF 30+ sunscreen":                           { name: "SPF 30+ 防晒霜" },
  "Insulating layer (fleece or puffy)":          { name: "保暖层（抓绒或羽绒）" },
  "Headlamp + spare batteries":                  { name: "头灯 + 备用电池" },
  "First aid kit":                               { name: "急救包" },
  "Lighter or matches (waterproof)":             { name: "打火机或防水火柴" },
  "Multi-tool / knife":                          { name: "多功能工具或刀" },
  "Emergency shelter (bivvy or space blanket)":  { name: "应急保温（睡袋套或保温毯）" },

  // Ecosystem: rainforest / gorge
  "Hardshell rain jacket (waterproof)": {
    name: "硬壳防水冲锋衣",
    why: "西北温带雨林一年四季都可能下雨",
  },
  "Rain pants":                                  { name: "雨裤" },
  "Pack rain cover":                             { name: "背包雨罩" },
  "Quick-dry synthetic layers (no cotton)":      { name: "速干化纤衣物（避免棉质）" },

  // Ecosystem: alpine
  "Insulated puffy (down or synthetic)": {
    name: "保暖羽绒（羽绒或化纤）",
    why: "高山日落时温度可骤降 15°C",
  },
  "Wind shell":                                  { name: "防风外壳" },
  "Beanie + lightweight gloves":                 { name: "毛线帽 + 轻量手套" },
  "Buff / neck gaiter (sun + wind)":             { name: "Buff 头巾（防晒 + 防风）" },
  "Microspikes (snowfields above 10k ft into July)": { name: "微型冰爪（3000 米以上夏季可能仍有雪）" },

  // Ecosystem: subalpine / volcanic
  "Insulating midlayer (fleece or puffy)":       { name: "中间保暖层（抓绒或羽绒）" },
  "Lightweight gloves":                          { name: "轻量手套" },

  // Ecosystem: desert
  "Wide-brim sun hat": {
    name: "宽檐防晒帽",
    why: "无遮蔽——防晒非选项",
  },
  "Long-sleeve sun hoody (UPF rated)":           { name: "UPF 长袖防晒帽衫" },
  "Extra water capacity (4L+ per person)": {
    name: "额外水容量（每人 4 升以上）",
    why: "沙漠徒步至少每小时 1 升",
  },
  "Electrolyte tablets":                         { name: "电解质片" },
  "Sun gloves":                                  { name: "防晒手套" },

  // Ecosystem: coastal
  "Tide chart printout": {
    name: "潮汐表（纸质）",
    why: "部分海岸路段涨潮无法通过",
  },
  "Quick-dry clothing (gets wet)":               { name: "速干衣物（会湿）" },
  "Sandals or wading shoes":                     { name: "凉鞋或涉水鞋" },
  "Wind shell (constant onshore wind)":          { name: "防风外壳（持续向岸风）" },

  // Ecosystem: redwood
  "Light rain jacket (fog drip is constant)":    { name: "薄雨衣（雾凇水滴持续）" },
  "Insect repellent (mosquitoes near streams)":  { name: "驱蚊液（溪边蚊虫多）" },

  // Ecosystem: chaparral
  "Sun hoody (UPF rated)": {
    name: "UPF 防晒帽衫",
    why: "暴露山脊、阳光强烈",
  },
  "Tick check awareness (lyme present in CA)":   { name: "注意检查蜱虫（加州存在莱姆病）" },

  // Season: winter
  "Microspikes or crampons": {
    name: "微型冰爪或冰爪",
    why: "西海岸大多数路线冬天有冰面",
  },
  "Insulated waterproof boots":                  { name: "保暖防水靴" },
  "Insulated gloves (waterproof)":               { name: "防水保暖手套" },
  "Warm hat (covers ears)":                      { name: "保暖帽（盖耳）" },
  "Hand warmers":                                { name: "暖手宝" },

  // Season: summer / spring
  "Bug head net (mosquito season July–Aug)":     { name: "防蚊头网（7–8 月蚊虫高峰）" },
  "Gaiters (mud + spring runoff)":               { name: "雪套（防泥 + 春季融雪）" },

  // Permit
  "Printed/saved permit": {
    name: "打印好或离线保存的许可",
    why: "进入点会有护林员检查",
  },
};

export interface LocalizedGear {
  name: string;
  why?: string;
}

/** Resolve display name + why for a gear item based on locale. */
export function localizeGear(
  item: { name: string; why?: string },
  locale: "en" | "zh",
): LocalizedGear {
  if (locale === "en") return { name: item.name, why: item.why };
  const zh = GEAR_ZH[item.name];
  return {
    name: zh?.name ?? item.name,
    why: zh?.why ?? item.why,
  };
}
