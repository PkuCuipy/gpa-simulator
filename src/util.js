function seemsByToken(elem) {
  return elem.innerText.match(/[a-z0-9]{32}/);
}

function seemsByPageCopy(elem) {
  return (elem.getElementsByClassName("semester-block").length !== 0);
}


function fetchCourseInfoAll(token, callback) {
  //TODO: 用 token 构造 url 去请求数据!
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
  // 统计所有课程信息
  let course_infos = [];
  let semester_blocks = [...DOMElem.getElementsByClassName("semester-block")];
  // console.log(DOMElem.getElementsByClassName("semester-block"));
  for (let block of semester_blocks.slice(0, -1)) {   // 最后一项是 "总绩点", 不是一个 "学期", 因此丢掉
                                                      // console.log(block);
    let semester_name = getDOMChild(block, [0,0,1,0,0,0]).innerText;
    let course_rows = block.getElementsByClassName("course-row");
    for (let row of course_rows) {
      // console.log(row);
      let name = getDOMChild(row, [0,1,0,0,0,0]).innerText;
      let semester = semester_name;
      let credit = Number(getDOMChild(row, [0,0,0,0,0]).innerText);
      let score = row.getElementsByClassName("score-tamperer")[0].value;
      let type_teacher = getDOMChild(row, [0,1,0,0,1]).innerText.split("-");
      let type = type_teacher[0].trim();
      let teacher = type_teacher[1].trim();
      let course_info = {
        name,
        semester,
        credit,
        score,
        type,
        teacher,
        is_user_created: false,
        edited_score: score,
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
      else { throw "无法解析成绩"; }
    }
    else {
      if (score >= 60 && score <= 100) {
        let credit = info.credit;
        let GPA = calcGPA(score);
        GPATotal += GPA * credit;
        creditTotal += credit;
      }
    }
  }
  return GPATotal / creditTotal;  // 加权平均
}



function calcGPA(grade) {
  return 4 - 3 * (100 - grade) ** 2 / 1600;
}




export {
  fetchCourseInfoAll,
  seemsByToken,
  seemsByPageCopy,
  parseCourseInfoAll,
  calcGPA,
  calcAvgGPA,
}

/* =============================================================== */
// document.addEventListener("DOMContentLoaded", () => {
//   document.getElementById("paste-here").oninput = handlePaste;
// });