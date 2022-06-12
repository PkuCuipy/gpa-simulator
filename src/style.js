import {score2gpa} from "./util.js";

// 100 分的颜色
const HSL_100 = {
  h: 95,
  s: 100,
  l: 70,
}

// 60 分的颜色
const HSL_60 = {
  h: -20,
  s: 90,
  l: 60,
}

// P / W / I / EX 的颜色
const HSL_P = {
  h: 218, s: 20, l: 50
};

// F / NP  的颜色
const HSL_F = {
  h: 218, s: 20, l: 85
};



export function score2hsl(score_str: String) {
  /* H: [0, 360]  S: [0, 100]  L: [0, 100] */
  if (score_str === "F" || score_str === "NP") {
    return HSL_P;
  }
  else if (score_str === "P" || score_str === "W" || score_str === "I" || score_str === "EX") {
    return HSL_F;
  }
  else {
    let score = Number(score_str);
    let prop = score2proportion(score) / 100;
    // 线性插值
    let h = prop * HSL_100.h + (1 - prop) * HSL_60.h;
    let s = prop * HSL_100.s + (1 - prop) * HSL_60.s;
    let l = prop * HSL_100.l + (1 - prop) * HSL_60.l;
    return {h, s, l};
  }
}

export function score2proportion(score_str: String) {
  /* -> [0, 100] */
  let score = Number(score_str);
  if (score >= 60 && score <= 100) {
    let gpa = score2gpa(score);
    return 100 * (gpa - 1.0) / 3;
  }
  else {
    return 100;
  }
}

