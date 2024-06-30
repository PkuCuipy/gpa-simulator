export const nextUniqueId = (() => {
  let id = 0;
  return () => {
    return id++;
  }
})();

export function normalize_score_from_isop(score) {
  /*** Copied from PKU-Helper source file `score_parser.js` ***/
  if(score==='合格') return 'P';
  else if(score==='不合格') return 'NP';
  else if(score==='缓考') return 'I';
  else if(score==='免修') return 'EX';
  else return score;
}

export function isValidScore(score: String) {
  return ((new Set(["P", "F", "W", "NP", "I", "EX", "DEL"])).has(score) || (score !== "" && Number(score) >= 0 && Number(score) <= 100));
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
      else { console.log("无法解析成绩! 注意——仅支持本科生成绩单——什么？您是本科生仍遇到此报错？请联系作者！") }
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

export function score2sortVal(course_info) {
  // 百分制成绩 => Number()
  // 非百分制成绩 => 认为 P > EX > I > NP > F > W, 分别赋予 -1, -2, -3, -4, -5, -6
  let score = Number(course_info.score);
  if (isNaN(score)) {
    switch (course_info.score) {
      case "P":  return -1;
      case "EX": return -2;
      case "I":  return -3;
      case "NP": return -4;
      case "F":  return -5;
      case "W":  return -6;
      default:
        console.log(`Unexpected error occurred! (course_info = ${course_info})`)
        return -7;
    }
  }
  return score;
}

