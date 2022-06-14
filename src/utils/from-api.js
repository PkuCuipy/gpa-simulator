import { nextUniqueId, normalize_score_from_isop } from "./miscs";

export function seemsLikeToken(text) {
  // 检查传入的 text 是否像是一个 user-token (32位数字字母组成)
  return text.match(/^[a-z0-9]{32}$/) !== null;
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