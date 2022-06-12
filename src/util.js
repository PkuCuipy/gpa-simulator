function seemsByToken(elem) {
  return elem.innerText.match(/^[a-z0-9]{32}$/);
}

function seemsByPageCopy(elem) {
  return (elem.getElementsByClassName("semester-block").length !== 0);
}

function normalize_score_from_isop(score) {
  /*** Copied from PKU-Helper source file `score_parser.js` ***/
  if(score==='合格') return 'P';
  else if(score==='不合格') return 'NP';
  else if(score==='缓考') return 'I';
  else if(score==='免修') return 'EX';
  else return score;
}

function fetchCourseInfoAll(token, callback) {
  // 用 token 构造 url 去请求数据, 然后解析出所需的所有课程信息, 最后喂给 callback 函数.
  const req = new XMLHttpRequest();
  req.open("GET", `https://pkuhelper.pku.edu.cn/api_xmcp/isop/scores?user_token=${token}&auto=no`);
  req.onload = function() {
    const response_json = JSON.parse(this.response);
    console.log(response_json);
    const course_infos = response_json.cjxx.map(info => ({
      is_user_created: false,
      name: info.kcmc,                                                    // 课程名称
      semester: [Number(info.xnd.match(/^(\d+)-/)[1]), Number(info.xq)],  // 学期
      credit: Number(info.xf),                                            // 学分
      score: normalize_score_from_isop(info.xqcj),                        // 学期成绩
      edited_score: normalize_score_from_isop(info.xqcj),
      type: info.kclbmc,                                                  // 课程类别名称
      teacher: info.skjsxm.match(/-(.+?)\$/)[1],                          // 授课教师姓名
    }));
    callback(course_infos);
  };
  req.send(null);
}

function getDOMChild(node, indices) {
  // indices 如 [1,0,0,0,1,2]
  let ret = node;
  for (let i of indices) {
    ret = ret.children[i];
  }
  return ret;
}

function parseCourseInfoAll(DOMElem) {
  // 从粘贴的 DOM 中 解析出所需的所有课程信息.
  let course_infos = [];
  let semester_blocks = [...DOMElem.getElementsByClassName("semester-block")];
  // console.log(DOMElem.getElementsByClassName("semester-block"));
  for (let block of semester_blocks.slice(0, -1)) {   /* 最后一项是 "总绩点", 不是一个 "学期", 因此丢掉 */
    // console.log(block);
    let semester_name = getDOMChild(block, [0,0,1,0,0,0]).innerText;
    let course_rows = block.getElementsByClassName("course-row");
    for (let row of course_rows) {
      // console.log(row);
      let name = getDOMChild(row, [0,1,0,0,0,0]).innerText;
      let semester = semester_name.match(/(\d+)学年 第(\d+)学期/).slice(1, 3).map(Number);     // "19学年 第2学期" --> [19, 2]
      let credit = Number(getDOMChild(row, [0,0,0,0,0]).innerText);
      let score = row.getElementsByClassName("score-tamperer")[0].value;
      let type_teacher = getDOMChild(row, [0,1,0,0,1]).innerText.split("-");
      let type = type_teacher[0].trim();
      let teacher = type_teacher[1].trim();
      let course_info = {
        is_user_created: false,
        name,
        semester,
        credit,
        score,
        edited_score: score,
        type,
        teacher,
      };
      // console.log(course_info);
      course_infos.push(course_info);
    }
  }
  // 防止用户输入中有 "新增成绩" 尚未 "已阅"
  course_infos = course_infos.filter(info => info.semester !== "新增成绩");
  return course_infos;
}

function calcAvgGPA(course_infos) {
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
      else { throw "无法解析成绩"; }
    }
    else {
      if (score >= 60 && score <= 100) {
        let credit = info.credit;
        let GPA = score2gpa(score);
        GPATotal += GPA * credit;
        creditTotal += credit;
      }
    }
  }
  return GPATotal / creditTotal;  // 加权平均
}

function score2gpa(score) {
  return 4 - 3 * (100 - score) ** 2 / 1600;
}

function score2gpa_printable(score) {
  if (score === "P") { return "通过"}
  else if (score === "F") { return "未通过"}
  else if (score === "W") { return "退课"}
  else if (score === "NP") { return "未通过"}
  else if (score === "I") { return "缓考"}
  else if (score === "EX") { return "免修"}
  else { return score2gpa(Number(score)).toFixed(3);}
}

export {
  fetchCourseInfoAll,
  seemsByToken,
  seemsByPageCopy,
  parseCourseInfoAll,
  score2gpa,
  calcAvgGPA,
  score2gpa_printable,
}