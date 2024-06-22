import { nextUniqueId } from "./miscs";

export function seemsByPageCopy(elem) {
  return (elem.getElementsByClassName("semester-block").length !== 0);
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
    console.log("b", block);
    let semester_name = getDOMChild(block, [0,0,1,0,0]).innerText;
    console.log("semester_name", semester_name);
    if (semester_name === "新增成绩") {
      continue;   // 防止用户输入中有 ｢新增成绩｣ 尚未 ｢已阅｣
    }
    let course_rows = block.getElementsByClassName("course-row");
    for (let row of course_rows) {
      let name = getDOMChild(row, [0,1,0,0,0]).innerText;
      // console.log("name", name);
      let semester = semester_name.match(/(\d+)学年 第(\d+)学期/).slice(1, 3).map(Number);     // "19学年 第2学期" --> [19, 2]
      let credit = Number(getDOMChild(row, [0,0,0,0]).innerText);
      // console.log("credit", credit);
      let score = getDOMChild(row, [0,2,0,0]).innerText.trim();
      // console.log("score", score);
      let type_teacher = getDOMChild(row, [0,1,0,1]).innerText.split("-");
      // console.log("type_teacher", type_teacher);
      let type = type_teacher[0].trim();
      // console.log("type", type);
      let teacher = type_teacher[1].trim();
      // console.log("teacher", teacher);
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
