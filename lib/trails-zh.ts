// Chinese translations for trail content. Trail names stay in English (proper nouns).
// Park unit names get a Chinese rendering for context.
//
// Lookup: TRAILS_ZH[trail.id] → { description, highlights, parkUnit }.
// Falls back to the English entry in lib/trails.ts when missing.

export interface TrailZh {
  parkUnit: string;
  description: string;
  highlights: string[];
  /** Optional Chinese override for `Trail.parking`. */
  parking?: string;
}

export const TRAILS_ZH: Record<string, TrailZh> = {
  "half-dome": {
    parkUnit: "优胜美地国家公园",
    description:
      "内华达山脉最具代表性的一日徒步：飞瀑、花岗岩台阶、传奇的钢缆登顶段——直上 Half Dome 8800 英尺花岗岩穹顶背面。多数人需要 14 小时。钢缆通常 5 月底至 10 月中旬开放。",
    highlights: ["Vernal & Nevada 双瀑布", "Sub Dome 钢缆段", "优胜美地谷顶峰视野"],
  },
  "clouds-rest": {
    parkUnit: "优胜美地国家公园",
    description:
      "一条狭长的花岗岩刀脊，从优胜美地谷拔升 4500 英尺。许多人认为这里是公园里视野最好的位置——能从上方俯瞰 Half Dome 的侧影。",
    highlights: ["花岗岩脊行走", "360° 高内华达全景", "俯瞰 Half Dome"],
  },
  "mist-trail": {
    parkUnit: "优胜美地国家公园",
    description:
      "优胜美地谷的招牌瀑布徒步。沿花岗岩台阶直接穿过 317 英尺 Vernal Fall 的水雾，再到 594 英尺 Nevada Fall 的崖顶。",
    highlights: ["走过瀑布水雾", "Emerald Pool 翠绿水潭", "Liberty Cap"],
  },
  "upper-yosemite-falls": {
    parkUnit: "优胜美地国家公园",
    description:
      "Z 字盘山道沿崖壁攀升，紧贴北美最高瀑布。崖顶视野令人窒息——但 8 月之后水量会变成涓涓细流。",
    highlights: ["Columbia Rock 观景点", "2425 英尺瀑布顶端", "Yosemite Point 延伸路线"],
  },
  "cathedral-lakes": {
    parkUnit: "优胜美地国家公园",
    description:
      "Tuolumne Meadows 最受欢迎的徒步线之一——穿过 lodgepole 松林缓缓上行，抵达 Cathedral Peak 尖塔下方一对冰川湖。",
    highlights: ["Cathedral Peak 倒影", "野花草甸", "Tioga Pass 山口风光"],
  },
  "sentinel-taft": {
    parkUnit: "优胜美地国家公园",
    description:
      "用一条短环线把优胜美地两个最佳观景点串起来。Sentinel Dome 是 360° 全景；Taft Point 把你送到一个无护栏的 3000 英尺悬崖边。",
    highlights: ["Taft Point 悬崖裂缝", "Sentinel Dome 全景", "看日落首选" ],
  },
  "mt-whitney": {
    parkUnit: "因约国家森林",
    description:
      "美国本土 48 州最高峰，海拔 14,505 英尺。22 英里往返、爬升超过 6000 英尺、99 个 Z 字弯——加上让多数人崩溃的高反。需通过抽签申请许可。",
    highlights: ["本土最高峰", "Trail Crest 山口", "99 个回头弯"],
  },
  jmt: {
    parkUnit: "优胜美地至红杉国家公园",
    description:
      "John Muir Trail：211 英里高内华达精华——从优胜美地谷一直走到 Whitney 山顶。穿越 8 个 11000 英尺以上的山口、3 个国家公园。是美国西部最经典的长距离穿越。",
    highlights: ["Donohue Pass", "Evolution Valley", "Forester Pass（PCT 最高点）", "登顶 Whitney 收尾"],
  },
  "rae-lakes": {
    parkUnit: "国王峡谷国家公园",
    description:
      "经典 4-5 天高内华达环线——穿过彩绘花岗岩盆地、高山草甸、Painted Lady 山下的钴蓝色湖链。Glen Pass 11,978 英尺为关键路段。",
    highlights: ["Rae Lakes 盆地", "Glen Pass 山口", "Mist Falls"],
  },
  "tahoe-rim": {
    parkUnit: "塔霍湖盆地",
    description:
      "165 英里环湖大穿越，绕塔霍湖一圈，途经 6 片荒野和 3 个国家森林。平均海拔 8000 英尺，全程几乎都能看到湖。一般 10-14 天完成或分段走。",
    highlights: ["Desolation 荒野", "Mt Rose 登顶", "全程湖景"],
  },

  wonderland: {
    parkUnit: "雷尼尔山国家公园",
    description:
      "93 英里环线绕雷尼尔山一周——太平洋西北最经典的多日穿越，没有之一。横跨山上每一种生态。10-14 天，许可抽签竞争激烈。",
    highlights: ["Spray Park 野花海", "Indian Bar", "Summerland", "全程雷尼尔山视野"],
  },
  "skyline-paradise": {
    parkUnit: "雷尼尔山国家公园",
    description:
      "从 Paradise 出发的招牌一日游。穿过野花草甸登上 Panorama Point，被冰川和 Tatoosh Range 山脉环绕。7 月底花期最盛。",
    highlights: ["Myrtle Falls", "Panorama Point", "Nisqually 冰川观景"],
  },
  "naches-peak": {
    parkUnit: "雷尼尔山国家公园",
    description:
      "Chinook Pass 山口附近一条短环线，亲子友好——风景密度极高：高山小湖、野花、雷尼尔山正面照。",
    highlights: ["Tipsoo Lake 倒影", "PCT 一段", "秋天的越橘"],
  },
  burroughs: {
    parkUnit: "雷尼尔山国家公园",
    description:
      "雷尼尔东北侧的极地苔原台地。三段 Burroughs 山尖一段比一段离 Emmons 冰川更近——不需要绳索就能离冰川最近的距离。",
    highlights: ["Emmons 冰川观景", "苔原生态", "Frozen Lake"],
  },
  "tolmie-peak": {
    parkUnit: "雷尼尔山国家公园",
    description:
      "Eunice Lake 上方一座历史悠久的火警瞭望台，正对雷尼尔山的明信片视角。开车到 Mowich Lake 是一段颠簸的碎石路——但绝对值得。",
    highlights: ["Eunice Lake", "1933 年火警瞭望台", "Mowich Lake"],
  },

  "hall-of-mosses": {
    parkUnit: "奥林匹克国家公园",
    description:
      "在地球上少有的温带雨林里漫步。大叶枫挂着苔藓帘子，整个森林都泛着绿光。",
    highlights: ["Sitka 老云杉", "苔藓覆盖的枫树", "全年开放"],
  },
  "hurricane-hill": {
    parkUnit: "奥林匹克国家公园",
    description:
      "先铺装路再泥土路，登上海拔 5757 英尺的山顶——视野从奥林匹克腹地一直延伸到温哥华岛。常能看到黑尾鹿和土拨鼠。",
    highlights: ["胡安德富卡海峡视野", "奥林匹斯山轮廓", "野花"],
  },
  "storm-king": {
    parkUnit: "奥林匹克国家公园",
    description:
      "Lake Crescent 上方一段陡峭得令人发指的攀爬，最后用固定绳爬上一条刀脊山顶。低头直视 2000 英尺下方的湖面非常震撼。",
    highlights: ["Lake Crescent 俯瞰", "拉绳 scramble 段", "可加 Marymere Falls"],
  },
  "shi-shi": {
    parkUnit: "奥林匹克国家公园",
    description:
      "太平洋海岸最原始的一段：从泥泞的森林木栈道走出来，是 2 英里沙滩，最后到达 Point of the Arches 海蚀石迷宫。需提前看潮汐。",
    highlights: ["海蚀石", "潮汐池", "海滩露营"],
  },
  "high-divide": {
    parkUnit: "奥林匹克国家公园",
    description:
      "奥林匹克 NP 顶级多日环线：钴蓝色的湖泊盆地、面对 Mt Olympus 冰原的高脊、加上夏末几乎必见的黑熊。",
    highlights: ["Mt Olympus 冰川视野", "Heart Lake", "Bogachiel Peak"],
  },
  "sol-duc-falls": {
    parkUnit: "奥林匹克国家公园",
    description:
      "在原始 Douglas fir 树林里平坦走一程，到达三层瀑布坠入苔藓峡谷。冬天可达，景色更佳。",
    highlights: ["三段式瀑布", "原生森林", "全年可达"],
  },

  "maple-pass": {
    parkUnit: "Okanogan-Wenatchee 国家森林",
    description:
      "公认北喀斯喀特最佳的一日环线。山脊行走，俯瞰 Lake Ann、Heather Pass，以及无数锯齿状山峰。9 月底落叶松金黄。",
    highlights: ["秋天的落叶松", "Lake Ann 俯瞰", "Heather Pass 山脊"],
  },
  "cascade-pass": {
    parkUnit: "北喀斯喀特国家公园",
    description:
      "从北喀斯喀特深处的鞍部出发，沿一条刀脊上到 7600 英尺的 Sahale 冰川营地——四面被本土 48 州最壮观的山围绕。",
    highlights: ["Sahale 冰川", "山羊出没", "本山脉最戏剧化的天际线"],
  },
  "blue-lake": {
    parkUnit: "Okanogan-Wenatchee 国家森林",
    description:
      "短距离接近一个绿松石色高山湖，被 Liberty Bell、Early Winter Spires 围绕——秋天还有金色的落叶松。喀斯喀特里付出最少、回报最大的徒步。",
    highlights: ["Liberty Bell 尖塔", "10 月落叶松", "适合新手的高山线" ],
  },
  "hidden-lake": {
    parkUnit: "Mt Baker-Snoqualmie 国家森林",
    description:
      "陡峭攀爬到一座 1931 年的火警瞭望台，建在 6890 英尺一根花岗岩尖柱上——华盛顿州最常被拍的视角之一。",
    highlights: ["1931 年瞭望台", "花岗岩脊 scramble", "Hidden Lake 俯瞰"],
  },
  heliotrope: {
    parkUnit: "Mt Baker-Snoqualmie 国家森林",
    description:
      "登山者的接近线，让非登山者也能离 Coleman 冰川 100 码内——不用冰镐就能看冰隙。",
    highlights: ["Coleman 冰川舌", "Mt Baker 近距离", "几处溪流过水"],
  },

  timberline: {
    parkUnit: "胡德山国家森林",
    description:
      "41 英里环胡德山一周——俄勒冈州的招牌多日穿越。冰川河涉水、野花草甸、头顶持续可见的 11250 英尺火山主峰。",
    highlights: ["Ramona Falls", "Eliot 冰川过河", "Paradise Park 野花"],
  },
  "garfield-peak": {
    parkUnit: "火口湖国家公园",
    description:
      "无需后野许可就能拍到的最佳火口湖视角。从 Rim Village 上到 8054 英尺山顶，整个火山口尽收眼底。",
    highlights: ["火山口顶全景", "Wizard Island 视角", "远眺 Klamath Basin"],
  },
  "south-sister": {
    parkUnit: "三姐妹荒野",
    description:
      "非技术性登顶俄勒冈第三高峰，10358 英尺。火山砾石路、山顶火山口湖、整个喀斯喀特链一目了然。",
    highlights: ["山顶火山口湖", "Middle / North Sister 侧面", "Lewis 冰川"],
  },
  "eagle-creek": {
    parkUnit: "哥伦比亚河谷",
    description:
      "瀑布接瀑布的玄武岩峡谷，最后达到 Tunnel Falls——175 英尺瀑布后有人凿出的隧道可以穿过。崖边路段有钢缆扶手——恐高慎入。",
    highlights: ["Punchbowl Falls", "High Bridge", "穿过 Tunnel Falls 后方"],
  },
  "multnomah-wahkeena": {
    parkUnit: "哥伦比亚河谷",
    description:
      "把俄勒冈最有名的两座瀑布串成一个森林环线。Multnomah Falls 是 620 英尺双层壮观；Wahkeena 在背面再添一道丝带瀑布。",
    highlights: ["Multnomah Falls", "Wahkeena Falls", "Benson 桥"],
  },
  "smith-rock": {
    parkUnit: "Smith Rock 州立公园",
    description:
      "Crooked River 峡谷上方一条短而极其上镜的环线。攀岩者挂在每一面悬崖——Smith Rock 是美国运动攀的发源地。",
    highlights: ["Monkey Face 尖塔", "Crooked River 峡谷", "到处是攀岩者"],
  },

  "lassen-peak": {
    parkUnit: "拉森火山国家公园",
    description:
      "登顶 10457 英尺的活火山——美国最近期喷发的火山之一（1915 年）。视野横跨 Mt Shasta、内华达山脉，山下还能看到冒蒸汽的地热区。",
    highlights: ["活火山顶", "Mt Shasta 视野", "蒸汽喷气孔"],
  },
  "bumpass-hell": {
    parkUnit: "拉森火山国家公园",
    description:
      "一条木栈道穿过公园里最大的地热区。沸腾泥潭、喷气孔、绿松石色水池——像没有人挤的黄石。",
    highlights: ["沸腾泥潭", "喷气孔", "穿过温泉的木栈道"],
  },
  "fern-canyon": {
    parkUnit: "Prairie Creek 红杉州立公园",
    description:
      "50 英尺深、两侧覆盖 7 种蕨类的峡谷。曾是《侏罗纪公园 2》取景地。5-9 月需提前预约时段，可能涉水。",
    highlights: ["蕨类覆盖的峡谷壁", "侏罗纪公园取景地", "周边红杉"],
  },
  "lost-coast": {
    parkUnit: "King Range 国家保护区",
    description:
      "加州唯一真正荒野化的海岸线——25 英里黑沙滩夹在两条公路之间。强依赖潮汐：两段海蚀区只能在退潮时通过。需带防熊罐。",
    highlights: ["黑沙滩", "潮汐限定通道", "罗斯福麋鹿和海豹"],
  },

  "ryan-mountain": {
    parkUnit: "约书亚树国家公园",
    description:
      "短而陡的攀升登上 Joshua Tree 中心山顶。360° 视野横跨 Wonderland of Rocks、Salton 海，天气好时甚至能看到 San Gorgonio 雪峰。",
    highlights: ["Wonderland of Rocks 全景", "日出日落首选", "冬天可见 San Gorgonio"],
  },
  "telescope-peak": {
    parkUnit: "死亡谷国家公园",
    description:
      "死亡谷 NP 最高点 11049 英尺，得名于能在同一视野里看到 Badwater（-282 英尺）和 Whitney 山（14505 英尺）。",
    highlights: ["古狐尾松", "同框 Badwater 和 Whitney", "积雪可能持续到 6 月"],
  },
  "san-jacinto": {
    parkUnit: "San Jacinto 州立荒野",
    description:
      "从棕榈泉乘空中电缆车从沙漠地表升到 8500 英尺，然后徒步 5.5 英里登上 10834 英尺峰顶——本土 48 州里单日垂直落差最大的山。",
    highlights: ["空中电缆车上山", "Round Valley 草甸", "山顶巨石 scramble"],
  },
  "mt-baldy": {
    parkUnit: "天使国家森林",
    description:
      "洛杉矶的家山，10064 英尺。Devil's Backbone 山脊是经典环线——窄、暴露、登顶视野从 Catalina 一直到 Mojave 沙漠。",
    highlights: ["魔鬼脊", "Catalina 岛视野", "大角羊出没"],
  },
  smugglers: {
    parkUnit: "海峡群岛国家公园",
    description:
      "从 Ventura 坐船过去，再在 Santa Cruz 岛上沿海岸纵穿到一处安静的海湾。岛上特有的 island fox、海崖、零拥挤——美国访问量最少的国家公园在这里发光。",
    highlights: ["Island fox 出没", "海崖视野", "Smugglers 橄榄园遗迹"],
  },

  ewoldsen: {
    parkUnit: "Julia Pfeiffer Burns 州立公园",
    description:
      "大苏尔海岸上方的红杉峡谷环线，配上标志性的 McWay Falls 观景点——80 英尺瀑布直接落到沙滩上。",
    highlights: ["McWay Falls 观景点", "红杉峡谷", "太平洋全景"],
  },
  "tomales-point": {
    parkUnit: "Point Reyes 国家海岸",
    description:
      "穿越 Tule 麋鹿保护区抵达 Point Reyes 北端的一条迎风山脊。数百头麋鹿、左右两侧海湾、远端一座灯塔。",
    highlights: ["Tule 麋鹿群", "同框看海与湾", "春天野花"],
  },
  alamere: {
    parkUnit: "Point Reyes 国家海岸",
    description:
      "罕见的「潮汐瀑布」——直接坠入海滩。13 英里海岸线沿途经过隐藏湖泊和悬崖草地，最后一段需要 scramble 下到瀑布脚下。",
    highlights: ["潮汐瀑布坠入沙滩", "Bass Lake 游泳", "山猫出没"],
  },
  "mt-tam": {
    parkUnit: "Mt Tamalpais 州立公园",
    description:
      "湾区的招牌山。东峰山顶可俯瞰旧金山、Farallon 群岛，运气好时还能看到内华达山脊。",
    highlights: ["旧金山天际线", "Old Railroad Grade 路", "Verna Dunshee 山顶环线"],
  },
  "andrew-molera": {
    parkUnit: "Andrew Molera 州立公园",
    description:
      "大苏尔最佳环线徒步：崖顶路俯瞰拍岸海浪、一片隐藏沙滩、再沿白杨树河谷返回。",
    highlights: ["崖顶海景", "Molera 海滩", "Big Sur 河口"],
  },
  "mt-diablo": {
    parkUnit: "Mt Diablo 州立公园",
    description:
      "陡攀 3849 英尺山顶，是北美少数能看到最大可视面积的山顶之一：晴天能从内华达山一直看到 Farallon 群岛。",
    highlights: ["可视面积相当于 35 个州", "野花超级花期", "Mary Bowerman 山顶环线"],
  },
  "high-peaks-pinnacles": {
    parkUnit: "Pinnacles 国家公园",
    description:
      "嵌在火山尖塔里的钢制扶手把你带过西部最稳定的加州神鹰栖息地之一。美国最年轻的国家公园。",
    highlights: ["加州神鹰可见", "嵌在岩里的台阶", "周边有 talus 洞穴"],
  },

  pct: {
    parkUnit: "墨西哥至加拿大",
    description:
      "Pacific Crest Trail 太平洋山脊步道：2650 英里从墨西哥走到加拿大，纵贯西海岸所有主要山脉。5-6 个月的承诺，已经成为一代人的成人礼。长距离许可由抽签发放。",
    highlights: ["3 个州、25 个国家森林、7 个国家公园", "从沙漠到冰川", "全球最被拍摄的长穿越"],
  },
  "mt-si": {
    parkUnit: "Mt Si 自然资源保护区",
    description:
      "西雅图的训练山之王。一段无情的森林上山，离市中心只要 30 分钟车程，登顶是俯瞰 Snoqualmie 谷的草垛山顶。",
    highlights: ["西雅图天际线视野", "喀斯喀特至奥林匹克全景", "全年可达"],
  },

  // ----- New batch -----
  "mist-falls": {
    parkUnit: "国王峡谷国家公园",
    description:
      "沿 Kings 河穿越 Paradise Valley 的长距离平路，最终抵达初夏水量充沛、水雾喷过步道的 100 英尺瀑布。",
    highlights: ["Kings 河峡谷", "100 英尺 Mist 瀑布", "头顶花岗岩穹顶"],
    parking: "180 号公路东端尽头的 Roads End 起点停车场。门票 35 美元/车（7 天有效）。夏季周末 9 点前停满；可乘免费 Cedar Grove 接驳车。",
  },
  "lakes-trail": {
    parkUnit: "红杉国家公园",
    description:
      "从 Wolverton 沿 Watchtower 悬崖攀升到一串冰川湖：Heather、Aster、Emerald、最后是 Pear——全部嵌在花岗岩墙下。",
    highlights: ["Watchtower 悬崖边缘", "四个冰斗湖", "Pear Lake 花岗岩湖盆"],
    parking: "Generals Highway 旁的 Wolverton 停车场。门票 35 美元/车。容量充足，但冬季（11–5 月）会因雪封路。",
  },
  "moro-rock": {
    parkUnit: "红杉国家公园",
    description:
      "在花岗岩穹顶上凿出的 350 级台阶，登顶 6725 英尺，向东可见整片 Great Western Divide 山脉。",
    highlights: ["凿岩石阶", "Great Western Divide 全景", "看日落首选"],
    parking: "Crescent Meadow Road 旁的小停车场。夏季（5 月底–9 月）9–16 点禁止私家车，需乘 Giant Forest Museum 免费接驳车。",
  },
  "tokopah-falls": {
    parkUnit: "红杉国家公园",
    description:
      "沿 Marble Fork 穿过松林，抵达从花岗岩崖壁倾泻而下的 1200 英尺瀑布——5 月底至 6 月水量最大。",
    highlights: ["Marble Fork 峡谷", "1200 英尺 Tokopah 瀑布", "碎石坡上的旱獭"],
    parking: "Lodgepole 营地白天停车场。门票 35 美元/车。穿过营地走到河上的桥就是起点。",
  },

  "tom-dick-harry": {
    parkUnit: "胡德山国家森林",
    description:
      "经过 Mirror Lake 经典的胡德山倒影，沿森林山脊到达三峰横切，火山填满整个东方天空。",
    highlights: ["Mirror Lake 倒影", "胡德山正面视野", "三个石质山峰"],
    parking: "26 号公路旁 Mirror Lake 起点停车场。需购 Northwest Forest Pass（5 美元/天 或 30 美元/年）。周末 9 点前停满；东侧 0.3 英里有备用停车点。",
  },
  "mcneil-point": {
    parkUnit: "胡德山国家森林",
    description:
      "从 Top Spur 起点穿过雪崩百合与鲁冰花草甸，攀升至 6100 英尺胡德山西北肩上的石屋，俯瞰 Sandy 冰川。",
    highlights: ["Bald Mountain 草甸", "CCC 石屋", "Sandy 冰川眺望"],
    parking: "FS 1828 号路尽头的 Top Spur 起点，碎石路面颠簸——干燥天气轿车也能开。需 Northwest Forest Pass。约 15 个车位，夏季周末 8 点前停满。",
  },
  "tamanawas-falls": {
    parkUnit: "胡德山国家森林",
    description:
      "沿 Cold Spring 溪走一段平缓的森林路，抵达一道宽 110 英尺的水帘——水量适中时可绕到瀑布后面。",
    highlights: ["Cold Spring 溪", "可走到瀑布后面", "原始森林"],
    parking: "35 号公路 73 英里处路边停车带（Sherwood 营地对面）。免费，无需通行证。约 25 个车位。",
  },
  "cooper-spur": {
    parkUnit: "胡德山国家森林",
    description:
      "胡德山上最高的非技术性徒步——攀升火山东北肩到 8500 英尺，Eliot 冰川就在脚下断裂。",
    highlights: ["Tilly Jane 庇护所", "Eliot 冰川冰裂缝", "8500 英尺折返石"],
    parking: "FS 3512 号土路尽头的 Cloud Cap Saddle 起点，从 35 号公路开土路要 25 分钟。需 Northwest Forest Pass。10 月至次年 6 月因雪关闭。",
  },

  "cinder-cone": {
    parkUnit: "拉森火山国家公园",
    description:
      "在松软火山灰上爬一座完美对称的 700 英尺火山锥，环锥顶俯瞰彩色的 Painted Dunes 与 Fantastic 熔岩床。",
    highlights: ["Painted Dunes 眺望", "Fantastic 熔岩床", "两道环形火山口可走"],
    parking: "Butte Lake 营地白天停车场，FS 32N21 路尽头（44 号公路向东 6 英里碎石路）。门票 30 美元/车。30+ 车位，几乎不会满。",
  },

  "hidden-valley": {
    parkUnit: "约书亚树国家公园",
    description:
      "了解约书亚树花岗岩景观的经典入门：被 100 英尺巨石墙围合的偷牛贼藏匿地，遍布抱石线路。",
    highlights: ["花岗岩巨石圆形剧场", "世界级抱石", "约书亚树林"],
    parking: "Park Boulevard 旁的 Hidden Valley 野餐区停车场。门票 30 美元/车（7 天）。凉季周末 9 点至中午停满；建议早到或下午 2 点后。",
  },
  "lost-palms-oasis": {
    parkUnit: "约书亚树国家公园",
    description:
      "穿越 Colorado 沙漠干河床与岩脊，抵达一处隐秘峡谷——公园里最大的本地加州扇棕榈群落紧贴泉眼生长。",
    highlights: ["Cottonwood 泉绿洲", "70+ 棵峡谷扇棕榈", "偶见沙漠大角羊"],
    parking: "南门入口 Cottonwood Spring 白天停车场（10 号州际公路下）。门票 30 美元/车。全年容量充足。",
  },
  "forty-nine-palms": {
    parkUnit: "约书亚树国家公园",
    description:
      "从 Twentynine Palms 镇外的沙漠脊上一道陡坡，抵达一处由泉水滋养、藏在岩石峡谷顶部的扇棕榈绿洲。",
    highlights: ["Mojave 与 Colorado 沙漠交界", "扇棕榈绿洲", "大角羊足迹"],
    parking: "62 号公路 Canyon Road 尽头的小停车场。免费（在公园门外）。约 20 个车位，周末 9 点前停满。",
  },

  "kendall-katwalk": {
    parkUnit: "Mt Baker–Snoqualmie 国家森林",
    description:
      "沿 PCT 长距离上行，抵达一段在花岗岩崖面上炸出的 Katwalk 横切——身后是层层叠叠的喀斯喀特山脉。",
    highlights: ["岩崖凿出的 Katwalk", "Kendall Peak 山脊线", "夏末欧石南草甸"],
    parking: "I-90 高速 52 出口（Snoqualmie Pass）的 PCT 起点停车场。需 Northwest Forest Pass（5 美元/天）。两个大停车场，夏季周末 8 点前停满。",
  },
  "cutthroat-pass": {
    parkUnit: "Okanogan-Wenatchee 国家森林",
    description:
      "穿过原始落叶松与冷杉林之字形上山，登顶可见喀斯喀特东侧山脉延展——9 月底高山落叶松金黄一片，是西海岸最壮观的秋色之一。",
    highlights: ["9 月底金色落叶松", "Cutthroat Peak 花岗岩尖塔", "Methow 山谷视野"],
    parking: "20 号公路 158 英里处的 Rainy Pass PCT 停车场。需 Northwest Forest Pass。20 号公路冬季关闭（约 11 月中至 4 月中）。",
  },

  "marymere-falls": {
    parkUnit: "奥林匹克国家公园",
    description:
      "奥林匹克最容易的瀑布徒步——沿 Crescent 湖畔老龄道格拉斯冷杉林平走，抵达一条溅入蕨类岩窟的 90 英尺瀑布。",
    highlights: ["原始道格拉斯冷杉", "90 英尺 Marymere 瀑布", "Crescent 湖岸"],
    parking: "Crescent 湖边、101 号公路旁的 Storm King 护林站停车场。门票 30 美元/车（7 天）。50+ 车位，几乎不会满。",
  },

  "lake-22": {
    parkUnit: "Mt Baker–Snoqualmie 国家森林",
    description:
      "穿过古老雪松与道格拉斯冷杉之字形上山，抵达 Pilchuck 山南面悬崖下的冰斗湖——碎石坡、瀑布、应有尽有。",
    highlights: ["原始雪松林", "Pilchuck 悬崖下冰斗湖", "上山途中的瀑布群"],
    parking: "Mountain Loop Highway（Granite Falls 东 13 英里）旁的起点停车场。需 Northwest Forest Pass。30 个车位，夏季周末 8 点前停满。",
  },
  "chain-lakes": {
    parkUnit: "Mt Baker–Snoqualmie 国家森林",
    description:
      "Mt Baker 在一侧、Mt Shuksan 在另一侧，中间串起四个高山湖——欧石南脊线、蓝莓坡，是喀斯喀特最浓缩的山景之一。",
    highlights: ["Baker + Shuksan 同框", "四个高山湖", "9 月末欧石南转红"],
    parking: "542 号公路（Mt Baker Highway）尽头的 Artist Point 停车场。免费。多年只有 7 月中至 9 月才解封通车。",
  },

  "eaton-canyon": {
    parkUnit: "Eaton Canyon 自然保护区 / Angeles 国家森林",
    description:
      "洛杉矶经典的家庭徒步——沿沙质河床上行至 40 英尺瀑布，藏在阴凉的窄缝里。即使夏天峡谷收窄后也很凉爽。",
    highlights: ["春季 chaparral 野花", "40 英尺 First Falls", "多次过溪"],
    parking: "Altadena Drive 旁的 Eaton Canyon 自然中心停车场。免费。80 个车位，周末 9 点前停满；可在 New York Drive 路边备选停车。",
  },
  "solstice-canyon": {
    parkUnit: "Santa Monica 山脉国家娱乐区",
    description:
      "Malibu 北侧 sycamore 树荫蔽的峡谷，终点是被烧毁的 Roberts 牧场——石头地基、变野的热带花园、一道终年涓涓细流的瀑布。",
    highlights: ["焚毁的牧场遗址", "sycamore 林荫小溪", "终年细瀑"],
    parking: "Corral Canyon Road 旁起点的 NPS 停车场。免费。60 个车位，周末 10–14 点停满。",
  },

  "mt-st-helens": {
    parkUnit: "圣海伦斯火山国家纪念地",
    description:
      "沿火山灰与房子大小巨石的非技术性攀爬抵达南火山口边缘，脚下 1300 英尺是 1980 年大爆炸留下的圆形凹陷与冒烟的熔岩穹丘。",
    highlights: ["站在火山口边缘", "俯瞰冒烟熔岩穹丘", "山顶可见 Adams + Hood + Rainier 三座火山"],
    parking: "FS 830 号路尽头的 Climbers' Bivouac（最后 3 英里碎石路）。4–10 月需登山许可（mtsthelenspermit.com，每天 100 张，春季抽签）。停车需 NW Forest Pass。",
  },

  "mission-peak": {
    parkUnit: "Mission Peak 区域保护区",
    description:
      "南湾的训练山——沿西坡陡峭暴露地一气爬到标志性的 2517 英尺山顶旗杆，晴天可从 Mt Tam 一直看到 Mt Hamilton。",
    highlights: ["山顶自拍杆", "南湾 360° 全景", "看日出首选"],
    parking: "Fremont 的 Stanford Avenue staging area。免费，但位于居民区——周边路严格执行 2 小时限时停车。停车场周末 7 点前停满；Ohlone College 起点是更安静的备选。",
  },
  "point-lobos": {
    parkUnit: "Point Lobos 州立自然保护区",
    description:
      "把 North Shore、Cypress Grove、South Shore 几条小路串成环线，绕加州最常被拍摄的海岬一周——海獭、港海豹，还有地球上唯一原生的 Monterey 柏树林。",
    highlights: ["Cypress Grove 扭曲的柏树", "海狮岩", "Bird Island 看灰鲸"],
    parking: "1 号公路旁的主入口停车场，10 美元/车日票。容量限流——满后单出单进。周末避开 11–14 点。",
  },
  "pfeiffer-falls": {
    parkUnit: "Pfeiffer Big Sur 州立公园",
    description:
      "一段短环线深入红杉树荫的峡谷，经过 60 英尺瀑布，再到 Valley View 观景点眺望 Big Sur 河谷与太平洋的交汇。",
    highlights: ["60 英尺 Pfeiffer 瀑布", "原始红杉林", "山谷至海洋的眺望"],
    parking: "1 号公路旁的 Pfeiffer Big Sur 州立公园白天停车场，10 美元/车。2021 年灾后改线重新开放。70 个车位，夏季周末 10–15 点停满。",
  },

  "mt-scott-crater": {
    parkUnit: "火山口湖国家公园",
    description:
      "Crater Lake 国家公园最高点 8929 英尺——之字形穿越开阔的火山脊，登顶火警瞭望台俯瞰整个火山口与湖最深的蓝色。",
    highlights: ["公园最高点", "俯视 Crater Lake", "运营中的 CCC 火警瞭望台"],
    parking: "East Rim Drive 第 17 英里处（距公园总部）的路边停车带。门票 30 美元/车。Rim Drive 通常 6 月底至 10 月开放。",
  },

  "angels-rest": {
    parkUnit: "哥伦比亚河峡谷国家风景区",
    description:
      "沿峡谷壁陡峭爬升到一块伸出哥伦比亚河上方的玄武岩前突——离波特兰最近的震撼级视野，也是 2017 年 Eagle Creek 大火后正在恢复的森林。",
    highlights: ["前段的 Coopey 瀑布", "玄武岩前突观景", "灾后恢复的森林"],
    parking: "历史悠久的 Columbia River Highway 第 28 英里附近的路边停车点。免费。停车点小，周末 8 点前停满；可使用 Bridal Veil 备用停车场。",
  },
};
