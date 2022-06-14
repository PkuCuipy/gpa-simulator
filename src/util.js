export const nextUniqueId = (() => {
  let id = 0;
  return () => {
    return id++;
  }
})();

export function seemsLikeToken(text) {
  return text.match(/^[a-z0-9]{32}$/) !== null;
}

export function seemsByPageCopy(elem) {
  return (elem.getElementsByClassName("semester-block").length !== 0);
}

export function normalize_score_from_isop(score) {
  /*** Copied from PKU-Helper source file `score_parser.js` ***/
  if(score==='合格') return 'P';
  else if(score==='不合格') return 'NP';
  else if(score==='缓考') return 'I';
  else if(score==='免修') return 'EX';
  else return score;
}

export function isValidScore(score: String) {
  return ((new Set(["P", "F", "W", "NP", "I", "EX"])).has(score) || (score !== "" && Number(score) >= 0 && Number(score) <= 100));
}

export function fetchCourseInfoAll(token, callback) {
  // 用 token 构造 url 去请求数据, 然后解析出所需的所有课程信息, 最后喂给 callback 函数.
  const req = new XMLHttpRequest();
  req.open("GET", `https://pkuhelper.pku.edu.cn/api_xmcp/isop/scores?user_token=${token}&auto=no`);
  req.onload = function() {
    const response_json = JSON.parse(this.response);
    const course_infos = response_json.cjxx.map(info => ({
      is_user_created: false,
      unique_id: nextUniqueId(),
      name: info.kcmc,                                                    // 课程名称
      semester: [Number(info.xnd.match(/^(\d+)-/)[1]), Number(info.xq)],  // 学期
      credit: Number(info.xf),                                            // 学分
      score: normalize_score_from_isop(info.xqcj),                        // 学期成绩
      original_score: normalize_score_from_isop(info.xqcj),
      type: info.kclbmc,                                                  // 课程类别名称
      teacher: info.skjsxm.match(/-(.+?)\$/)[1],                          // 授课教师姓名
    }));
    callback(course_infos);
  };
  req.send(null);
}

export function getDOMChild(node, indices) {
  // indices 如 [1,0,0,0,1,2]
  let ret = node;
  for (let i of indices) {
    ret = ret.children[i];
  }
  return ret;
}

export function parseCourseInfoAll(DOMElem) {
  // 从粘贴的 DOM 中 解析出所需的所有课程信息.
  let course_infos = [];
  let semester_blocks = [...DOMElem.getElementsByClassName("semester-block")];
  for (let block of semester_blocks.slice(0, -1)) {   /* 最后一项是 "总绩点", 不是一个 "学期", 因此丢掉 */
    let semester_name = getDOMChild(block, [0,0,1,0,0,0]).innerText;
    if (semester_name === "新增成绩") {
      continue;   // 防止用户输入中有 ｢新增成绩｣ 尚未 ｢已阅｣
    }
    let course_rows = block.getElementsByClassName("course-row");
    for (let row of course_rows) {
      let name = getDOMChild(row, [0,1,0,0,0,0]).innerText;
      let semester = semester_name.match(/(\d+)学年 第(\d+)学期/).slice(1, 3).map(Number);     // "19学年 第2学期" --> [19, 2]
      let credit = Number(getDOMChild(row, [0,0,0,0,0]).innerText);
      let score = row.getElementsByClassName("score-tamperer")[0].value;
      let type_teacher = getDOMChild(row, [0,1,0,0,1]).innerText.split("-");
      let type = type_teacher[0].trim();
      let teacher = type_teacher[1].trim();
      let course_info = {
        is_user_created: false,
        unique_id: nextUniqueId(),
        name,
        semester,
        credit,
        score,
        original_score: score,
        type,
        teacher,
      };
      course_infos.push(course_info);
    }
  }
  course_infos = course_infos.filter(info => info.semester !== "新增成绩");
  return course_infos;
}


export function randomGenerateSomeCourseInfo() {

  function randint(min: Int, max: Int) {
    // 随机生成整数 (min 和 max 都是 inclusive 的!)
    let rand = Math.random();
    while (rand === 0 || rand === 1) {rand = Math.random();}
    return Math.floor((max - min + 1) * rand + min);
  }

  function random_choice(list: Array) {
    // 列表中随机选一个元素
    return list[randint(0, list.length - 1)];
  }

  function random_credit() {
    // 随机生成学分
    return randint(1, 5);
  }

  function random_course_name() {
    // 随机生成课程名
    const prefixes = ["高级", "宏观", "学术", "高等", "计算", "工程", "大学", "应用", "", "", ""];
    const concepts = ["数学", "语言", "外国语", "物理", "化学", "生物", "医学", "计算", "信息", "自然", "法学", "哲学", "心理", "社会", "传播", "新闻", "历史", "考古", "摄影", "运筹", "天体", "地理"]
    const connectives = ["与", "中的", "", ""]
    const suffixes = ["概论", "基础", "导论", "实践", "(A)", "(B)", "(C)", "(实验班)", "(上)", "(下)", "理论", "设计", "分析", "方法", "研讨班", "", "", ""];

    // 生成模式: prefix concept (connective concept)? suffix
    let prefix = random_choice(prefixes);
    let concept = random_choice(concepts);
    let have_second = random_choice([true, false]);
    let connective = have_second ? random_choice(connectives) : "";
    let concept2 = have_second ? random_choice(concepts) : "";
    let suffix = random_choice(suffixes);

    return "".concat(prefix, concept, connective, concept2, suffix);
  }

  function random_score() {
    // 随机生成成绩
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
  let generated_infos = [];
  let semesters = [[19, 1], [19, 2], [20, 1], [20, 2], [20, 3], [21, 1]];
  for (let semseter of semesters) {
    let num_courses = randint(4, 8);
    for (let _ = 0; _ < num_courses; _++) {
      let score = random_score();
      generated_infos.push({
        credit: random_credit(),
        is_user_created: false,
        name: random_course_name(),
        score,
        original_score: score,
        semester: semseter,
        teacher: "随机生成的课程",
        type: "随机生成的课程",
        unique_id: nextUniqueId(),
      });
    }
  }
  console.log(generated_infos);
  return generated_infos;
}


export function calcAvgGPA(course_infos) {
  // 计算总绩点
  let creditTotal = 0.0;
  let GPATotal = 0.0;
  for (let info of course_infos) {
    let score = parseFloat(info.score)
    if (isNaN(score)) {
      if (info.score === "P") { }
      else if (info.score === "F") { }
      else if (info.score === "W") { }
      else if (info.score === "NP") { }
      else if (info.score === "I") { }
      else if (info.score === "EX") { }
      else { throw Error("无法解析成绩"); }
    }
    else {
      if (score >= 60 && score <= 100) {
        let credit = info.credit;
        let GPA = score2gpa(score);
        GPATotal += GPA * credit;
        creditTotal += credit;
      }
      else {
        /* 按照 PKU-Helper 的计算规则, [0, 60) 的课程也不参与绩点计算 */
      }
    }
  }
  return GPATotal / creditTotal;  // 加权平均
}


export function score2gpa(score) {
  console.assert(60 <= score && score <= 100, `成绩 ${score} 无法进行 GPA 计算`);
  return 4 - 3 * (100 - score) ** 2 / 1600;
}

export function gpa2score(gpa) {
  console.assert(0 <= gpa && gpa <= 100, `GPA ${gpa} 无法进行分数折合!`);
  return 100 - Math.sqrt((6400 - 1600 * gpa) / 3);
}

export function score2gpa_printable(score: String) {
  if (score === "P") { return "通过"}
  else if (score === "F") { return "未通过"}
  else if (score === "W") { return "退课"}
  else if (score === "NP") { return "未通过"}
  else if (score === "I") { return "缓考"}
  else if (score === "EX") { return "免修"}
  else if (Number(score) < 60) { return "-" }
  else { return score2gpa(Number(score)).toFixed(3);}
}

export function gpa2score_printable(gpa) {
  return gpa2score(Number(gpa)).toFixed(1);
}

export function coursesGroupBySemester(course_infos) {
  /* 把所有课程根据 semester 分组 */
  const semester_names = [...new Set(course_infos.map(info => info.semester.join("-")))].sort();
  return semester_names.map(sem_name => ({
    semester: sem_name.split("-").map(Number),
    course_infos: course_infos.filter(info => info.semester.join("-") === sem_name),
  }));
}
