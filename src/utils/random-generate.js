import { nextUniqueId } from "./miscs";


export function randomGenerateSomeCourseInfo() {

  // 随机生成整数 (min 和 max 都是 inclusive 的!)
  function randint(min: Int, max: Int) {
    let rand = Math.random();
    while (rand === 0 || rand === 1) {rand = Math.random();}
    return Math.floor((max - min + 1) * rand + min);
  }

  // 列表中随机选一个元素
  function random_choice(list: Array) {
    return list[randint(0, list.length - 1)];
  }

  // 随机生成学分
  function random_credit() {
    return randint(1, 5);
  }

  // 随机生成课程名
  function random_course_name() {
    const prefixes = ["西方", "现代", "高级", "宏观", "学术", "高等", "计算", "工程", "大学", "应用", "公共",
                      "普通", "", "", "", "", "", "", "", "", "", "", ];
    const concepts = ["数学", "语言", "外国语", "物理", "化学", "生物", "医学", "计算", "信息", "电子",
                      "法学", "哲学", "心理", "社会", "传播", "新闻", "历史", "考古", "摄影",
                      "运筹", "天体", "地理", "光学", "系统", "机械", "电磁学", "农学", "游戏设计", "戏曲",
                      "音乐", "太极拳", "生殖", "航空", "航天", "健美", "环境", "美术", "文化", "统计",
                      "力学", "电路", "群众", "群论", "几何", "泛函", "优化", "随机过程", "程序设计", "软件", ]
    const connectives = ["与", "中的", "", ""]
    const suffixes = ["概论", "基础", "导论", "实践", "(A)", "(B)", "(C)", "(实验班)", "(上)", "(下)", "理论",
                      "设计", "分析", "方法", "研讨班", "通识", "实验", "问题研究", "原理", "赏析", "实习",
                      "", "", "", "", ];

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
  function random_score() {
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

  // 随机生成一张成绩单
  let semesters = [[19, 1], [19, 2], [20, 1], [20, 2], [20, 3], [21, 1]];
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
