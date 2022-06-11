function getDOMChild(node, indices) {
  // indices 如 [1,0,0,0,1,2]
  let ret = node;
  for (let i of indices) {
    ret = ret.children[i];
  }
  return ret;
}

function calcGPA(grade) {
  return 4 - 3 * (100 - grade) ** 2 / 1600;
}

function getCourseInfoAll(DOMElem) {
  // 统计所有课程信息
  let course_infos = [];
  let semester_blocks = [...DOMElem.getElementsByClassName("semester-block")];
  console.log(DOMElem.getElementsByClassName("semester-block"));
  for (let block of semester_blocks.slice(0, -1)) {   // 最后一项是 "总绩点", 不是一个 "学期", 因此丢掉
                                                      // console.log(block);
    let semester_name = getDOMChild(block, [0,0,1,0,0,0]).innerText;
    let course_rows = block.getElementsByClassName("course-row");
    for (let row of course_rows) {
      // console.log(row);
      let semester = semester_name;
      let credit = Number(getDOMChild(row, [0,0,0,0,0]).innerText);
      let grade = row.getElementsByClassName("score-tamperer")[0].value;
      let type_teacher = getDOMChild(row, [0,1,0,0,1]).innerText.split("-");
      let type = type_teacher[0].trim();
      let teacher = type_teacher[1].trim();
      let course_info = {semester, credit, grade, type, teacher};
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
    let grade = parseFloat(info.grade)
    if (isNaN(grade)) {
      if (info.grade === "P") { }
      else if (info.grade === "F") { }
      else if (info.grade === "W") { }
      else { throw "无法解析成绩"; }
    }
    else {
      if (grade >= 60 && grade <= 100) {
        let credit = info.credit;
        let GPA = calcGPA(grade);
        GPATotal += GPA * credit;
        creditTotal += credit;
      }
    }
  }

  let avgGPA = GPATotal / creditTotal;  // 加权平均
  return avgGPA;
}

function handlePaste(e) {
  let elem = e.target;
  let infos = getCourseInfoAll(elem);
  calcAvgGPA(infos)

  let container = document.getElementById("container");
  container.removeChild(elem);
  let new_pastebin = document.createElement("div");
  new_pastebin.id = "paste-here";
  new_pastebin.contentEditable = "true";
  new_pastebin.oninput = handlePaste;
  container.appendChild(new_pastebin);
}

/* =============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("paste-here").oninput = handlePaste;
});