import { nextUniqueId } from "./miscs";

// 随机生成整数 (min 和 max 都是 inclusive 的!)
export function randint(min, max) {
  let rand = Math.random();
  while (rand === 0 || rand === 1) {rand = Math.random();}
  return Math.floor((max - min + 1) * rand + min);
}

// 列表中随机选一个元素
export function random_choice(list) {
  return list[randint(0, list.length - 1)];
}

// 随机生成学分
export function random_credit() {
  return randint(1, 5);
}

// 随机生成课程名
export function random_course_name() {
  const prefixes = ["西方", "现代", "高级", "宏观", "学术", "高等", "计算", "工程", "大学", "应用", "公共",
                    "普通", "", "", "", "", "", "", "", "", ];
  const concepts = ["数学", "语言", "外国语", "物理", "化学", "生物", "医学", "计算", "信息", "电子",
                    "法学", "哲学", "心理", "社会", "传播", "新闻", "历史", "考古", "摄影",
                    "运筹", "天体", "地理", "光学", "系统", "机械", "电磁学", "农学", "游戏设计", "戏曲",
                    "音乐", "太极拳", "生殖", "航空", "航天", "健美", "环境", "美术", "文化", "统计",
                    "力学", "几何", ]
  const connectives = ["与", "中的", "", ""]
  const suffixes = ["概论", "基础", "导论", "实践", "(A)", "(B)", "(C)", "(实验班)", "(上)", "(下)", "理论",
                    "设计", "分析", "方法", "研讨班", "通识", "实验", "研究", "原理", "赏析", "实习",
                    "", "", ];

  // 生成模式: prefix concept (connective concept)? suffix
  let prefix = random_choice(prefixes);
  let concept = random_choice(concepts);
  let have_second = random_choice([true, false]);
  let connective = have_second ? random_choice(connectives) : "";
  let concept2 = have_second ? random_choice(concepts) : "";
  let suffix = random_choice(suffixes);
  return "".concat(prefix, concept, connective, concept2, suffix);
}

// 随机生成成绩
export function random_score() {
  let seed = Math.random();
  if (seed < 0.05) return "W";
  if (seed < 0.10) return "P";
  if (seed < 0.11) return "F";
  if (seed < 0.12) return "59";
  if (seed < 0.25) return String(randint(60, 75));
  if (seed < 0.80) return String(randint(75, 93));
  if (seed < 0.95) return String(randint(93, 99));
  return "100";
}

// 获取前一年 (注意 0 的前一年是 99)
const prevYear = (year) => ((year === 0) ? 99 : (year - 1));

// 根据当前时间, 计算当前所处学期
export function nowSemester() {

  let now = new Date();
  let month = Number(now.getMonth()) + 1;                   // 0 表示 1 月, 这里进行修正
  let year = Number(now.getFullYear()) % 100;               // 0, 1, ..., 99

  let semester;    // 取值 1, 2 或 3
  // 决定学期 (semester) 的规则:
  //    如果现在是 9、10、11、12、1、2 月, 认为是第 1 学期 (秋季);
  //    如果现在是 3、4、5、6、7 月, 认为是第 2 学期 (春季);
  //    如果现在是 8 月, 认为是第 3 学期 (暑期);
  switch (month) {
    case 9: case 10: case 11: case 12: case 1: case 2: semester = 1; break;
    case 3: case 4: case 5: case 6: case 7: semester = 2; break;
    case 8: semester = 3; break;
    default: break;
  }

  let acd_year;    // 取值 0, 1, ..., 99
  // 决定学年 (acd_year) 的规则: 假设现在是 19 年, 那么:
  //    如果现在是 9, 10, 11, 12 月, 那么学年为 19
  //    如果现在是 1, 2, 3, 4, 5, 6, 7, 8, 那么学年为 18
  if (9 <= month && month <= 12) {
    acd_year = year;
  } else {
    acd_year = prevYear(year);
  }

  return [acd_year, semester]
}


// 随机生成一张成绩单
export function randomGenerateSomeCourseInfo() {

  // 先生成一个名为 semesters 形如  [[19, 1], [19, 2], [20, 1], [20, 2], [20, 3], [21, 1], [21, 2]] 的列表
  let [nowYear, nowSem] = nowSemester();
  let lastYear = prevYear(nowYear);
  let twoYearsAgo = prevYear(lastYear);
  let semesters = [
    [twoYearsAgo, 1], [twoYearsAgo, 2],
    [lastYear, 1], [lastYear, 2], [lastYear, 3],
    ...[...Array(nowSem).keys()].map(sem => [nowYear, sem + 1]),
  ];

  // 然后为 semesters 中的每个学期随机生成一些课程
  let generated_infos = [];
  for (let semester of semesters) {
    let num_courses = randint(4, 8);
    for (let _ = 0; _ < num_courses; _++) {
      let score = random_score();
      generated_infos.push({
        credit: random_credit(),
        is_user_created: false,
        name: random_course_name(),
        score,
        original_score: score,
        semester,
        teacher: "随机生成的课程",
        type: "随机生成的课程",
        unique_id: nextUniqueId(),
      });
    }
  }
  return generated_infos;
}
