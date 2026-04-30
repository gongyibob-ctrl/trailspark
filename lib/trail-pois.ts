// Hand-curated points of interest for each trail — what hikers will actually
// see and want to know about. Distance is from trailhead in miles.
//
// Naming convention:
//   - English `name` for the canonical proper noun (we keep English for famous
//     US landmarks; Chinese sees the same name, optionally annotated below)
//   - `nameZh` overrides the display in Chinese mode when there's a well-known
//     Chinese rendering or a meaningful translation
//   - `m` = miles from trailhead (omit if the POI is "all along the route")
//   - `ft` = elevation in feet (only the notable ones — peaks, passes, summit)

export type POIType =
  | "peak" // mountains, summits, domes — anything you stand ON
  | "viewpoint" // panoramic spots, lookouts, fire towers
  | "waterfall"
  | "lake" // lakes, tarns, alpine pools
  | "pass" // mountain passes / saddles
  | "meadow" // wildflower fields, grasslands, gardens
  | "river" // rivers, creeks, springs
  | "tree" // famous trees, groves, old growth
  | "coast" // beaches, sea stacks, coves, headlands
  | "rock" // notable rock formations, fissures, climbing
  | "glacier"
  | "ruins" // historic structures, ranger stations, old roads
  | "wildlife"; // reliable wildlife spots

export interface POI {
  name: string;
  nameZh?: string;
  type: POIType;
  m?: number;
  ft?: number;
}

// Sources: NPS / USFS official trail descriptions, AllTrails-corroborated
// landmarks, climber's guides for technical terrain. Distances rounded to
// 0.1 mi where uncertain.
export const TRAIL_POIS: Record<string, POI[]> = {
  // ---------- Yosemite + High Sierra ----------
  "half-dome": [
    { name: "Happy Isles trailhead", nameZh: "Happy Isles 起点", type: "ruins", m: 0, ft: 4035 },
    { name: "Vernal Fall (317 ft)", nameZh: "Vernal 瀑布（317 英尺）", type: "waterfall", m: 0.8 },
    { name: "Emerald Pool", nameZh: "翡翠潭", type: "river", m: 1.2 },
    { name: "Nevada Fall (594 ft)", nameZh: "Nevada 瀑布（594 英尺）", type: "waterfall", m: 1.7 },
    { name: "Liberty Cap", type: "peak", m: 1.9 },
    { name: "Little Yosemite Valley", nameZh: "小优胜美地谷", type: "meadow", m: 3.5 },
    { name: "Sub Dome", type: "peak", m: 6.5 },
    { name: "Half Dome cables", nameZh: "Half Dome 钢缆段", type: "rock", m: 6.8 },
    { name: "Half Dome summit", nameZh: "Half Dome 顶峰", type: "peak", m: 7.1, ft: 8839 },
  ],
  "clouds-rest": [
    { name: "Sunrise trailhead", nameZh: "Sunrise 起点", type: "ruins", m: 0, ft: 8150 },
    { name: "Tenaya Lake (view)", nameZh: "Tenaya 湖（远眺）", type: "lake", m: 0.5 },
    { name: "Forsyth Trail junction", nameZh: "Forsyth 步道岔口", type: "ruins", m: 4 },
    { name: "Cloud's Rest summit", nameZh: "Cloud's Rest 顶峰", type: "peak", m: 7, ft: 9931 },
  ],
  "mist-trail": [
    { name: "Happy Isles trailhead", type: "ruins", m: 0, ft: 4035 },
    { name: "Vernal Fall footbridge", type: "viewpoint", m: 0.8 },
    { name: "Vernal Fall top", nameZh: "Vernal 瀑布顶", type: "waterfall", m: 1.2 },
    { name: "Emerald Pool / Silver Apron", nameZh: "翡翠潭 / 银瀑斜面", type: "river", m: 1.4 },
    { name: "Nevada Fall top", nameZh: "Nevada 瀑布顶", type: "waterfall", m: 2.7 },
  ],
  "upper-yosemite-falls": [
    { name: "Camp 4 trailhead", type: "ruins", m: 0, ft: 4000 },
    { name: "Columbia Rock", nameZh: "Columbia 巨石观景点", type: "viewpoint", m: 1 },
    { name: "Upper Yosemite Fall top", nameZh: "Yosemite 上瀑布顶", type: "waterfall", m: 3.6, ft: 6525 },
    { name: "Yosemite Point (side trip)", nameZh: "Yosemite Point（支线）", type: "viewpoint", m: 4.8, ft: 6936 },
  ],
  "cathedral-lakes": [
    { name: "Tuolumne Meadows trailhead", nameZh: "Tuolumne Meadows 起点", type: "meadow", m: 0, ft: 8565 },
    { name: "Lower Cathedral Lake", nameZh: "下 Cathedral 湖", type: "lake", m: 3.5 },
    { name: "Cathedral Peak", type: "peak", m: 3.5 },
    { name: "Upper Cathedral Lake", nameZh: "上 Cathedral 湖", type: "lake", m: 4 },
  ],
  "sentinel-taft": [
    { name: "Glacier Point Rd trailhead", type: "ruins", m: 0, ft: 7700 },
    { name: "Sentinel Dome summit", nameZh: "Sentinel Dome 顶", type: "peak", m: 1, ft: 8127 },
    { name: "Taft Point fissures", nameZh: "Taft Point 悬崖裂缝", type: "rock", m: 1.5 },
    { name: "Taft Point overlook", nameZh: "Taft Point 观景台", type: "viewpoint", m: 1.5 },
  ],
  "mt-whitney": [
    { name: "Whitney Portal", type: "ruins", m: 0, ft: 8360 },
    { name: "Lone Pine Lake", type: "lake", m: 3 },
    { name: "Mirror Lake", type: "lake", m: 4 },
    { name: "Trail Camp", type: "ruins", m: 6, ft: 12039 },
    { name: "99 Switchbacks", nameZh: "99 个回头弯", type: "rock", m: 8 },
    { name: "Trail Crest", type: "pass", m: 8.5, ft: 13650 },
    { name: "Mt Whitney summit", nameZh: "Whitney 山顶", type: "peak", m: 11, ft: 14505 },
  ],
  jmt: [
    { name: "Happy Isles (start)", nameZh: "Happy Isles（起点）", type: "ruins", m: 0, ft: 4035 },
    { name: "Tuolumne Meadows", nameZh: "Tuolumne Meadows 草甸", type: "meadow", m: 22, ft: 8650 },
    { name: "Donohue Pass", type: "pass", m: 30, ft: 11056 },
    { name: "Devils Postpile", nameZh: "Devils Postpile 火山岩柱", type: "rock", m: 56 },
    { name: "Evolution Valley", nameZh: "Evolution 谷", type: "meadow", m: 105 },
    { name: "Muir Pass", type: "pass", m: 113, ft: 11955 },
    { name: "Mather Pass", type: "pass", m: 130, ft: 12100 },
    { name: "Forester Pass (highest on PCT)", nameZh: "Forester Pass（PCT 最高点）", type: "pass", m: 175, ft: 13180 },
    { name: "Mt Whitney summit (finish)", nameZh: "Whitney 山顶（终点）", type: "peak", m: 211, ft: 14505 },
  ],
  "rae-lakes": [
    { name: "Roads End trailhead", type: "ruins", m: 0, ft: 5035 },
    { name: "Mist Falls", type: "waterfall", m: 4 },
    { name: "Paradise Valley", type: "meadow", m: 7 },
    { name: "Rae Lakes basin", nameZh: "Rae Lakes 湖盆", type: "lake", m: 16, ft: 10500 },
    { name: "Painted Lady", nameZh: "Painted Lady 山峰", type: "peak", m: 18 },
    { name: "Glen Pass", type: "pass", m: 20, ft: 11978 },
    { name: "Charlotte Lake", type: "lake", m: 24 },
    { name: "Bubbs Creek", type: "river", m: 33 },
  ],
  "tahoe-rim": [
    { name: "Tahoe Meadows TH", nameZh: "Tahoe Meadows 起点", type: "meadow", m: 0, ft: 8730 },
    { name: "Mt Rose summit", nameZh: "Mt Rose 山顶", type: "peak", m: 6, ft: 10778 },
    { name: "Marlette Lake", type: "lake", m: 30 },
    { name: "Spooner Summit", type: "pass", m: 50 },
    { name: "Echo Summit", type: "pass", m: 80 },
    { name: "Aloha Lake (Desolation)", nameZh: "Aloha 湖（Desolation 荒野）", type: "lake", m: 100, ft: 8120 },
    { name: "Twin Peaks", type: "peak", m: 130 },
    { name: "Big Meadow", type: "meadow", m: 140 },
  ],

  // ---------- Mt Rainier ----------
  wonderland: [
    { name: "Longmire (start)", type: "ruins", m: 0, ft: 2700 },
    { name: "Indian Bar camp", type: "ruins", m: 22 },
    { name: "Panhandle Gap (highest)", nameZh: "Panhandle Gap（最高点）", type: "pass", m: 28, ft: 6750 },
    { name: "Summerland", type: "meadow", m: 33 },
    { name: "Sunrise visitor area", nameZh: "Sunrise 游客区", type: "ruins", m: 45 },
    { name: "Mystic Lake", type: "lake", m: 55 },
    { name: "Spray Park wildflowers", nameZh: "Spray Park 野花海", type: "meadow", m: 65 },
    { name: "Mowich Lake", type: "lake", m: 73 },
    { name: "Klapatche Park", type: "meadow", m: 82 },
    { name: "Eagle Roost", type: "viewpoint", m: 88 },
  ],
  "skyline-paradise": [
    { name: "Paradise Inn (start)", type: "ruins", m: 0, ft: 5400 },
    { name: "Myrtle Falls", type: "waterfall", m: 0.4 },
    { name: "Glacier Vista", type: "viewpoint", m: 1.5 },
    { name: "Panorama Point", type: "viewpoint", m: 2.3, ft: 6800 },
    { name: "Nisqually Glacier (view)", nameZh: "Nisqually 冰川（俯瞰）", type: "glacier", m: 2 },
  ],
  "naches-peak": [
    { name: "Chinook Pass TH", nameZh: "Chinook Pass 起点", type: "pass", m: 0, ft: 5432 },
    { name: "Tipsoo Lake", type: "lake", m: 0.5 },
    { name: "Naches Peak overlook", nameZh: "Naches Peak 观景点", type: "viewpoint", m: 1.8 },
    { name: "Dewey Lake (view)", type: "lake", m: 2.1 },
    { name: "PCT junction", type: "ruins", m: 1.5 },
  ],
  burroughs: [
    { name: "Sunrise trailhead", type: "ruins", m: 0, ft: 6400 },
    { name: "Frozen Lake", type: "lake", m: 1.5 },
    { name: "1st Burroughs", type: "peak", m: 2.5, ft: 7200 },
    { name: "2nd Burroughs", type: "peak", m: 3.5, ft: 7400 },
    { name: "3rd Burroughs", type: "peak", m: 4.5, ft: 7828 },
    { name: "Emmons Glacier overlook", nameZh: "Emmons 冰川观景", type: "glacier", m: 4.5 },
  ],
  "tolmie-peak": [
    { name: "Mowich Lake TH", type: "lake", m: 0, ft: 4929 },
    { name: "Eunice Lake", type: "lake", m: 2.5 },
    { name: "Tolmie Peak Lookout", nameZh: "Tolmie Peak 火警瞭望台", type: "viewpoint", m: 3.25, ft: 5939 },
  ],

  // ---------- Olympic ----------
  "hall-of-mosses": [
    { name: "Hoh Visitor Center", nameZh: "Hoh 游客中心", type: "ruins", m: 0, ft: 560 },
    { name: "Big Sitka spruces", nameZh: "Sitka 老云杉", type: "tree", m: 0.2 },
    { name: "Hall of Mosses loop", nameZh: "苔藓殿堂环线", type: "tree", m: 0.4 },
  ],
  "hurricane-hill": [
    { name: "Hurricane Ridge TH", type: "ruins", m: 0, ft: 5242 },
    { name: "Hurricane Hill summit", nameZh: "Hurricane Hill 顶", type: "peak", m: 1.6, ft: 5757 },
    { name: "Strait of Juan de Fuca view", nameZh: "胡安德富卡海峡视野", type: "viewpoint", m: 1.6 },
    { name: "Mt Olympus skyline", nameZh: "奥林匹斯山轮廓", type: "viewpoint", m: 1.6 },
  ],
  "storm-king": [
    { name: "Lake Crescent TH", type: "lake", m: 0, ft: 580 },
    { name: "Marymere Falls junction", nameZh: "Marymere 瀑布岔口", type: "waterfall", m: 0.9 },
    { name: "Storm King ridge", type: "rock", m: 1.6 },
    { name: "Storm King summit cables", nameZh: "Storm King 顶钢缆段", type: "rock", m: 2 },
    { name: "Lake Crescent overlook", nameZh: "Lake Crescent 俯瞰", type: "viewpoint", m: 2 },
  ],
  "shi-shi": [
    { name: "Makah Reservation TH", type: "ruins", m: 0, ft: 200 },
    { name: "Beach access", type: "coast", m: 2 },
    { name: "Sea stacks", nameZh: "海蚀石群", type: "coast", m: 3 },
    { name: "Point of the Arches", nameZh: "Point of the Arches 海蚀拱", type: "coast", m: 4 },
  ],
  "high-divide": [
    { name: "Sol Duc TH", type: "ruins", m: 0, ft: 1950 },
    { name: "Sol Duc Falls", type: "waterfall", m: 0.8 },
    { name: "Heart Lake", type: "lake", m: 8, ft: 4750 },
    { name: "Bogachiel Peak", type: "peak", m: 10, ft: 5474 },
    { name: "High Divide ridge", nameZh: "High Divide 山脊", type: "viewpoint", m: 11 },
    { name: "Seven Lakes Basin", nameZh: "七湖盆地", type: "lake", m: 13 },
  ],
  "sol-duc-falls": [
    { name: "Sol Duc TH", type: "ruins", m: 0, ft: 1930 },
    { name: "Old growth Douglas fir", nameZh: "原生 Douglas fir 林", type: "tree", m: 0.5 },
    { name: "Sol Duc Falls", type: "waterfall", m: 0.8 },
  ],

  // ---------- North Cascades ----------
  "maple-pass": [
    { name: "Rainy Pass TH", type: "pass", m: 0, ft: 4855 },
    { name: "Lake Ann", type: "lake", m: 1.5 },
    { name: "Heather Pass", type: "pass", m: 3 },
    { name: "Maple Pass", type: "pass", m: 4, ft: 6650 },
    { name: "Larch trees (autumn gold)", nameZh: "落叶松（秋天金黄）", type: "tree", m: 4 },
  ],
  "cascade-pass": [
    { name: "Cascade Pass TH", type: "ruins", m: 0, ft: 3600 },
    { name: "Cascade Pass", type: "pass", m: 3.7, ft: 5392 },
    { name: "Doubtful Lake (view)", type: "lake", m: 4.5 },
    { name: "Sahale Glacier Camp", nameZh: "Sahale 冰川营地", type: "glacier", m: 6, ft: 7600 },
  ],
  "blue-lake": [
    { name: "Washington Pass TH", type: "pass", m: 0, ft: 5200 },
    { name: "Liberty Bell view", type: "viewpoint", m: 1 },
    { name: "Blue Lake", type: "lake", m: 2.2, ft: 6254 },
  ],
  "hidden-lake": [
    { name: "Hidden Lake TH", type: "ruins", m: 0, ft: 3500 },
    { name: "Sibley Creek", type: "river", m: 2 },
    { name: "Hidden Lake Lookout", nameZh: "Hidden Lake 瞭望台", type: "viewpoint", m: 4, ft: 6890 },
    { name: "Hidden Lake (view)", type: "lake", m: 4 },
  ],
  heliotrope: [
    { name: "Glacier Creek TH", type: "ruins", m: 0, ft: 3700 },
    { name: "Heliotrope Ridge", type: "rock", m: 1.5 },
    { name: "Coleman Glacier toe", nameZh: "Coleman 冰川舌", type: "glacier", m: 2.5, ft: 5500 },
  ],

  // ---------- Oregon ----------
  timberline: [
    { name: "Timberline Lodge", type: "ruins", m: 0, ft: 5960 },
    { name: "Paradise Park wildflowers", nameZh: "Paradise Park 野花", type: "meadow", m: 8 },
    { name: "Ramona Falls", type: "waterfall", m: 12 },
    { name: "Cairn Basin", type: "rock", m: 17 },
    { name: "Eden Park", type: "meadow", m: 19 },
    { name: "Cloud Cap", type: "viewpoint", m: 24 },
    { name: "Cooper Spur (highest)", nameZh: "Cooper Spur（最高点）", type: "peak", m: 27, ft: 8514 },
    { name: "Eliot Glacier crossing", nameZh: "Eliot 冰川过河", type: "glacier", m: 28 },
    { name: "Newton Creek", type: "river", m: 33 },
  ],
  "garfield-peak": [
    { name: "Crater Lake Rim Village", nameZh: "火口湖 Rim Village", type: "viewpoint", m: 0, ft: 7100 },
    { name: "Crater Lake (entire)", nameZh: "火口湖（全程可见）", type: "lake", m: 0 },
    { name: "Garfield Peak summit", nameZh: "Garfield Peak 顶", type: "peak", m: 1.7, ft: 8054 },
    { name: "Wizard Island view", nameZh: "Wizard Island 视角", type: "viewpoint", m: 1.7 },
  ],
  "south-sister": [
    { name: "Devils Lake TH", type: "lake", m: 0, ft: 5440 },
    { name: "Wickiup Plain", type: "meadow", m: 2 },
    { name: "Moraine Lake (view)", type: "lake", m: 3.5 },
    { name: "Lewis Glacier", type: "glacier", m: 5 },
    { name: "South Sister summit crater lake", nameZh: "South Sister 顶火山口湖", type: "lake", m: 6, ft: 10358 },
    { name: "South Sister summit", nameZh: "South Sister 山顶", type: "peak", m: 6, ft: 10358 },
  ],
  "eagle-creek": [
    { name: "Eagle Creek TH", type: "ruins", m: 0, ft: 200 },
    { name: "Punchbowl Falls", type: "waterfall", m: 2 },
    { name: "High Bridge", type: "rock", m: 3 },
    { name: "Tunnel Falls (175 ft)", nameZh: "Tunnel Falls（175 英尺）", type: "waterfall", m: 6 },
    { name: "Twister Falls", type: "waterfall", m: 6.4 },
  ],
  "multnomah-wahkeena": [
    { name: "Multnomah Falls (620 ft)", nameZh: "Multnomah 瀑布（620 英尺）", type: "waterfall", m: 0, ft: 50 },
    { name: "Benson Bridge", type: "rock", m: 0.2 },
    { name: "Multnomah Falls top", nameZh: "Multnomah 瀑布顶", type: "viewpoint", m: 1.1 },
    { name: "Wahkeena Falls", type: "waterfall", m: 2 },
  ],
  "smith-rock": [
    { name: "Smith Rock SP TH", type: "ruins", m: 0, ft: 2700 },
    { name: "Misery Ridge", type: "rock", m: 0.8 },
    { name: "Monkey Face spire", nameZh: "Monkey Face 尖塔", type: "rock", m: 1.5 },
    { name: "Crooked River", type: "river", m: 2.5 },
  ],

  // ---------- Northern California ----------
  "lassen-peak": [
    { name: "Lassen Peak TH", type: "ruins", m: 0, ft: 8500 },
    { name: "Lassen Peak summit", nameZh: "Lassen 火山顶", type: "peak", m: 2.5, ft: 10457 },
    { name: "Crater rim", nameZh: "火山口环", type: "rock", m: 2.5 },
    { name: "Mt Shasta view (clear days)", nameZh: "Mt Shasta 远眺（晴天）", type: "viewpoint", m: 2.5 },
  ],
  "bumpass-hell": [
    { name: "Bumpass Hell TH", type: "ruins", m: 0, ft: 8200 },
    { name: "Bumpass Hell basin", nameZh: "Bumpass Hell 地热盆地", type: "rock", m: 1.5 },
    { name: "Big Boiler (mud pot)", nameZh: "Big Boiler 沸腾泥潭", type: "river", m: 1.5 },
    { name: "Boiling pools", nameZh: "沸腾水潭", type: "river", m: 1.5 },
  ],
  "fern-canyon": [
    { name: "Fern Canyon TH", type: "ruins", m: 0, ft: 50 },
    { name: "Fern-covered walls", nameZh: "蕨类峡谷壁", type: "tree", m: 0.2 },
    { name: "Coastal redwoods (nearby)", nameZh: "海岸红杉（周边）", type: "tree", m: 0.5 },
  ],
  "lost-coast": [
    { name: "Mattole Beach TH", type: "coast", m: 0, ft: 0 },
    { name: "Punta Gorda Lighthouse", nameZh: "Punta Gorda 灯塔", type: "ruins", m: 3 },
    { name: "Sea Lion Gulch", type: "wildlife", m: 4 },
    { name: "Big Flat", type: "meadow", m: 14 },
    { name: "Spanish Flat", type: "meadow", m: 19 },
    { name: "Black Sands Beach", nameZh: "黑沙滩", type: "coast", m: 25 },
  ],

  // ---------- Southern CA + Desert ----------
  "ryan-mountain": [
    { name: "Ryan Mountain TH", type: "ruins", m: 0, ft: 4400 },
    { name: "Ryan Mountain summit", nameZh: "Ryan Mountain 顶", type: "peak", m: 1.5, ft: 5457 },
    { name: "Wonderland of Rocks view", nameZh: "Wonderland of Rocks 视角", type: "viewpoint", m: 1.5 },
  ],
  "telescope-peak": [
    { name: "Mahogany Flat TH", type: "ruins", m: 0, ft: 8133 },
    { name: "Arcane Meadows", type: "meadow", m: 2 },
    { name: "Bristlecone pines", nameZh: "古狐尾松", type: "tree", m: 4 },
    { name: "Telescope Peak summit", nameZh: "Telescope Peak 顶", type: "peak", m: 7, ft: 11049 },
    { name: "Badwater Basin view (-282 ft)", nameZh: "Badwater 盆地俯瞰（-282 英尺）", type: "viewpoint", m: 7 },
  ],
  "san-jacinto": [
    { name: "Tram top station", nameZh: "缆车上站", type: "ruins", m: 0, ft: 8516 },
    { name: "Round Valley", type: "meadow", m: 2 },
    { name: "Wellman Divide", type: "pass", m: 4 },
    { name: "Mt San Jacinto summit", nameZh: "San Jacinto 山顶", type: "peak", m: 5.5, ft: 10834 },
    { name: "Coachella Valley view", nameZh: "Coachella 谷视角", type: "viewpoint", m: 5.5 },
  ],
  "mt-baldy": [
    { name: "Manker Flats TH", type: "ruins", m: 0, ft: 6160 },
    { name: "San Antonio Falls junction", nameZh: "San Antonio 瀑布岔口", type: "waterfall", m: 0.5 },
    { name: "Devil's Backbone ridge", nameZh: "魔鬼脊", type: "rock", m: 3 },
    { name: "Mt Harwood", type: "peak", m: 4, ft: 9552 },
    { name: "Mt Baldy summit", nameZh: "Baldy 山顶", type: "peak", m: 5, ft: 10064 },
  ],
  smugglers: [
    { name: "Scorpion Anchorage", type: "coast", m: 0, ft: 0 },
    { name: "Olive grove ruins", nameZh: "橄榄园遗迹", type: "ruins", m: 1 },
    { name: "Cliff overlook", nameZh: "悬崖观景", type: "viewpoint", m: 2.5 },
    { name: "Smugglers Cove", type: "coast", m: 3.7 },
  ],

  // ---------- Big Sur + Bay ----------
  ewoldsen: [
    { name: "Julia Pfeiffer Burns TH", type: "ruins", m: 0, ft: 50 },
    { name: "McWay Falls overlook (80 ft)", nameZh: "McWay 瀑布观景台（80 英尺）", type: "waterfall", m: 0.3 },
    { name: "McWay Cove (view)", nameZh: "McWay 海湾", type: "coast", m: 0.3 },
    { name: "Redwood canyon loop", nameZh: "红杉峡谷环线", type: "tree", m: 1.5 },
  ],
  "tomales-point": [
    { name: "Pierce Point Ranch", type: "ruins", m: 0, ft: 220 },
    { name: "Tule Elk Reserve", nameZh: "Tule 麋鹿保护区", type: "wildlife", m: 1 },
    { name: "Bird Rock view", type: "viewpoint", m: 3 },
    { name: "Tomales Point", type: "coast", m: 4.7 },
  ],
  alamere: [
    { name: "Palomarin TH", type: "ruins", m: 0, ft: 160 },
    { name: "Bass Lake (swim)", nameZh: "Bass 湖（可游泳）", type: "lake", m: 3 },
    { name: "Pelican Lake", type: "lake", m: 4 },
    { name: "Wildcat Camp", type: "ruins", m: 5 },
    { name: "Alamere Falls (tidefall)", nameZh: "Alamere 瀑布（潮汐瀑布）", type: "waterfall", m: 5.5 },
  ],
  "mt-tam": [
    { name: "Pantoll Ranger Station", nameZh: "Pantoll 护林员站", type: "ruins", m: 0, ft: 1500 },
    { name: "Old Railroad Grade", nameZh: "Old Railroad 步道", type: "ruins", m: 1 },
    { name: "Verna Dunshee Loop", type: "viewpoint", m: 2.8 },
    { name: "Gardner Lookout", type: "viewpoint", m: 3 },
    { name: "East Peak summit", nameZh: "East Peak 顶", type: "peak", m: 3, ft: 2571 },
  ],
  "andrew-molera": [
    { name: "Andrew Molera TH", type: "ruins", m: 0, ft: 200 },
    { name: "Big Sur River mouth", nameZh: "Big Sur 河口", type: "river", m: 0.5 },
    { name: "Molera Beach", type: "coast", m: 0.7 },
    { name: "Bluff Trail headlands", nameZh: "Bluff Trail 海角", type: "viewpoint", m: 2.5 },
    { name: "Cooper's Cabin (historic)", nameZh: "Cooper 小屋（历史遗迹）", type: "ruins", m: 4.5 },
  ],
  "mt-diablo": [
    { name: "Mitchell Canyon TH", type: "ruins", m: 0, ft: 570 },
    { name: "Eagle Peak (view)", type: "peak", m: 2.2 },
    { name: "Murchio Gap", type: "pass", m: 2.8 },
    { name: "Mt Diablo summit", nameZh: "Diablo 山顶", type: "peak", m: 3.2, ft: 3849 },
    { name: "Mary Bowerman summit loop", nameZh: "Mary Bowerman 顶环线", type: "viewpoint", m: 3.4 },
  ],
  "high-peaks-pinnacles": [
    { name: "Bear Gulch TH", type: "ruins", m: 0, ft: 1200 },
    { name: "Condor Gulch overlook", nameZh: "Condor Gulch 观景", type: "wildlife", m: 1 },
    { name: "High Peaks junction", type: "ruins", m: 1.5 },
    { name: "Steel handhold steps", nameZh: "嵌入岩石的钢台阶", type: "rock", m: 2 },
    { name: "High Peaks summit", nameZh: "High Peaks 顶", type: "peak", m: 2.8, ft: 2605 },
    { name: "California condor habitat", nameZh: "加州神鹰栖息地", type: "wildlife", m: 2.8 },
  ],

  // ---------- Thru-hikes / misc ----------
  pct: [
    { name: "Campo southern terminus", nameZh: "Campo 南端起点", type: "ruins", m: 0, ft: 2900 },
    { name: "Mt San Jacinto (view)", nameZh: "Mt San Jacinto（远眺）", type: "peak", m: 200 },
    { name: "Mt Whitney summit (side trip)", nameZh: "Whitney 山顶（支线）", type: "peak", m: 700, ft: 14505 },
    { name: "Forester Pass (highest)", nameZh: "Forester Pass（最高点）", type: "pass", m: 779, ft: 13180 },
    { name: "Yosemite Valley (Tuolumne)", nameZh: "优胜美地（Tuolumne）", type: "meadow", m: 940 },
    { name: "Crater Lake", nameZh: "火口湖", type: "lake", m: 1810 },
    { name: "Mt Hood (Timberline)", nameZh: "胡德山（Timberline）", type: "peak", m: 2100 },
    { name: "Mt Rainier visible", nameZh: "雷尼尔山（远眺）", type: "peak", m: 2330 },
    { name: "Manning Park (northern terminus)", nameZh: "Manning Park 北端终点", type: "ruins", m: 2650 },
  ],
  "mt-si": [
    { name: "Mt Si TH", type: "ruins", m: 0, ft: 560 },
    { name: "Snag Flats", type: "tree", m: 2 },
    { name: "Mt Si plateau", nameZh: "Mt Si 顶台", type: "viewpoint", m: 4, ft: 4000 },
    { name: "Haystack base", nameZh: "Haystack 草垛山顶", type: "peak", m: 4, ft: 4167 },
  ],
};

export function getTrailPOIs(trailId: string): POI[] {
  return TRAIL_POIS[trailId] ?? [];
}
