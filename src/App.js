import "./css/App.css";
import { Component, useState } from "react";
import back_icon from "./icons/back.svg";
import add_icon from "./icons/add.svg";
import random_icon from "./icons/dice.svg";
import { calcAvgGPA, coursesGroupBySemester, gpa2score, gpa2score_printable, score2gpa_printable, score2sortVal, isValidScore, nextUniqueId, } from "./utils/miscs.js";
import { hsl2hslprintable, score2hsl, score2proportion } from "./utils/color.js";
import { seemsByPageCopy, parseCourseInfoAll } from "./utils/from-paste.js";
import {
  randomGenerateSomeCourseInfo,
  random_course_name,
  random_credit,
  random_score,
  nowSemester
} from "./utils/random-generate.js";
import { seemsLikeToken, fetchCourseInfoAll } from "./utils/from-api.js";


/* ------------------------------ 顶栏 ------------------------------ */
function TitleBar() {
  return (
    <div id={"title-bar"}>
      GPA Simulator
    </div>
  );
}

/* ------------------------------ 底栏 ------------------------------ */
function BottomBar() {
  return (
    <div id={"bottom-bar"}>
      <div> ️⚠︎ 本页面结果仅供参考, 请以学校官方结果为准! </div>
      <div> 绩点公式: GPA(x) = 4 - 3(100 - x)² / 1600 </div>
      <div> ️基于 GPLv3 协议在 <a href="https://github.com/PkuCuipy/gpa-simulator" style={{color: "inherit"}} target="_blank" rel="noreferrer"> GitHub</a> 开源 </div>
    </div>
  );
}

/* ------------------------------ 设置 ------------------------------ */
function Settings(props) {
  return (
    <div id={"settings"}>
      <Button name={"返回导入成绩界面 (F1)"} icon={back_icon} onClick={props.onClickImport}/>
      <Button name={"添加一门新的课程 (F2)"} icon={add_icon} onClick={props.onNewCourse}/>
      <Button name={"随机生成成绩单 (F3)"} icon={random_icon} onClick={props.onRandomGenerate}/>
    </div>
  )
}

function Button(props) {
  return (
    <span className="settings-button" onClick={props.onClick}>
      {props.icon && <img src={props.icon} alt="import-icon" width="16" height="16" style={{marginRight: ".2rem"}}></img>}
      <span> {props.name} </span>
    </span>
  )
}

/* ------------------------------ 导入器 ------------------------------ */
function Importer(props) {
  return (
    <div id={"importer"}>
      <div id={"import-prompt"}>
        <div style={{fontSize: "1.25rem", fontWeight: "Bold", marginTop: "0.5rem", marginBottom: "0.5rem", textShadow: "0 0 1rem white"}}> 开始使用 </div>
          <div>
            <strong>【方式一】</strong>
            <button onClick={props.onRandomGenerate}> 🎲 点击这里 </button> <strong>随机生成</strong>一份成绩单
          </div>
          <div>
            <strong>【方式二】</strong>
            <button onClick={props.onCreateBlank}>➕新建成绩单</button> 创建一份空白成绩单
          </div>
          <div>
            <strong>【方式三】导入官方成绩单：</strong>
            访问北大树洞<a style={{textDecoration: "none", fontWeight: "Bold"}} href="https://treehole.pku.edu.cn/web/webscore" target="_blank" rel="noreferrer">
            成绩查询页</a>，<strong>全选并复制整个页面</strong>，粘贴到下方：
            <br/>
            <strong>【无法复制？】</strong>
            <div style={{paddingLeft: "0.8rem", fontSize: "1rem", lineHeight: "1.3rem"}}>
              1. 请使用<strong>电脑端</strong>网页，其余设备作者未测试过。<br/>
              2. 请刷新<strong>树洞成绩查询页</strong>后，再尝试全选复制。<br/>
              3. 若仍无法复制，请尝试禁用 <code>user-select: none</code>，或考虑<a href="https://github.com/PkuCuipy/gpa-simulator" target="_blank" rel="noreferrer">贡献本仓库</a>。
            </div>
          </div>
          <div>
            <strong>【2024/06 注】</strong><br/>
            <div style={{paddingLeft: "0.8rem", fontSize: "1rem", lineHeight: "1.3rem"}}>
              作者本人已从 P 大毕业，无权继续访问成绩查询页，因此无法保证本站对官方成绩单查询页的长期兼容。欢迎贡献<a href="https://github.com/PkuCuipy/gpa-simulator" target="_blank" rel="noreferrer">本仓库</a>，作者会尽己所能提供帮助。
            </div>
          </div>
      </div>
      <div id={"paste-here"} contentEditable={"true"} onInput={props.onPaste}>
      </div>
    </div>
  );
}

/* ------------------------------ 成绩单 ------------------------------ */
function GradeBook(props) {
  // Grouped by ｢学期名｣
  const semester_infos = coursesGroupBySemester(props.courseInfos);
  return (
      <div id={"grade-book"}>
        {semester_infos.map(info =>
          <SemesterChunk
            courseInfos={info.course_infos}
            semesterName={`${String(info.semester[0]).padStart(2, "0")}学年 第${info.semester[1]}学期`}
            changeScoreOfCourse={props.changeScoreOfCourse}
            key={info.semester}
          />
        )}
      </div>
  );
}

function SemesterChunk(props) {
  console.assert(props.courseInfos.length !== 0, "不允许存在不包含课程的学期!");

  // 计算 <SemesterRow> 所需的信息.
  // 注意 React 禁止修改 props, 而 sort() 是 inplace 的! 所以需要 slice() 先复制一份然后再 sort().
  const course_infos = props.courseInfos.slice().sort((a, b) => {
    let va = score2sortVal(a);
    let vb = score2sortVal(b);
    if (va !== vb) {
      return vb - va;
    } else {
      return Number(a.name < b.name) - 0.5;   // bool --> {0 或 1}, 这里减去 0.5 则得到 {-0.5 或 +0.5}
    }
  });

  // 计算这个学期的课程数、有效学分数、平均 GPA
  const num_courses = course_infos.length;
  const total_credits = course_infos
    .filter(d=>d.score !== "W" && d.score !== "F" && d.score !== "NP" && (isNaN(Number(d.score)) || Number(d.score) >= 60))
    .map(d=>d.credit)
    .reduce((a, b) => a + b, 0);
  const avg_gpa = calcAvgGPA(course_infos);

  // 渲染一个 <SemesterRow> + 若干个 <CourseRow>
  return (
    <div className={"semester-chunk"}>
      <SemesterRow semesterInfo={{
        semester_name: props.semesterName,
        num_courses,
        total_credits,
        avg_gpa,
      }}/>
      <div className={"rows"}>
        {course_infos.map(info =>
          <CourseRow
            courseInfo={info}
            changeScoreOfCourse={props.changeScoreOfCourse}
            key={info.unique_id}
          />
        )}
      </div>
    </div>
  );
}

function SemesterRow(props) {
  return (
    <div className={"semester-row"}>
      <span className={"left"}>
        <span className={"up"}> {props.semesterInfo.total_credits} </span>
        <span className={"down"}> 学分 </span>
      </span>
      <span className={"middle"}>
        <span className={"up"}> {props.semesterInfo.semester_name} </span>
        <span className={"down"}> 共 {props.semesterInfo.num_courses} 门课程 </span>
      </span>
      <span className={"right"}>
        <span className={"up"}> {Number.isNaN(props.semesterInfo.avg_gpa) ? "-.---" :  props.semesterInfo.avg_gpa.toFixed(3)} </span>  {/* 如果是 NaN, 则更友好地显示为 -.--- */}
        <span className={"down"}> (折合 { Number.isNaN(props.semesterInfo.avg_gpa) ? "--.-" :  gpa2score_printable(props.semesterInfo.avg_gpa)}) </span>  {/* 如果是 NaN, 则更友好地显示为 -.--- */}
      </span>
    </div>
  );
}

function CourseRow(props) {
  // 计算颜色
  let {h, s, l} = score2hsl(props.courseInfo.score);
  let p = score2proportion(props.courseInfo.score);

  return (
    <div
      className={"course-row" + (Number(props.courseInfo.score) === 100 ? " rainbow-moving" : "")    /* 如果是 100 分, 则添加一个实现彩虹色的 class */}
      style={ Number(props.courseInfo.score) === 100 ? {} :
             { background: `linear-gradient(to right, hsl(${h}, ${s}%, ${l}%)               ${0}%, 
                                                      hsl(${h}, ${s}%, ${l}%)               ${p}%, 
                                                      hsl(${h}, ${s * 0.8}%, ${l * 1.1}%)   ${p}%)` }}>
      <span className={"left"}>
        <span className={"up"}> {props.courseInfo.credit} </span>
        <span className={"down"}> 学分 </span>
      </span>
      <span className={"middle"}>
        <span className={"up"}> {props.courseInfo.name} </span>
        <span className={"down"}> {props.courseInfo.teacher} </span>
      </span>
      <span className={"right"}>
        <span
          className={"up"}
          contentEditable={"true"}
          suppressContentEditableWarning={true}
          onBlur={
            (event) => {    /* 注意这里得用 onBlur 而不是 onFocusout! */
              let new_score = event.target.innerText.trim();
              event.target.innerText = new_score;
              if (isValidScore(new_score)) {
                props.changeScoreOfCourse(props.courseInfo.unique_id, new_score);
              } else {
                event.target.innerText = props.courseInfo.original_score;
                props.changeScoreOfCourse(props.courseInfo.unique_id, props.courseInfo.original_score);
              }
            }
          }
          onKeyDown={
            (event) => {
              if (event.key.toLowerCase() === "enter") {
                event.preventDefault();       /* 这是 React 阻止事件默认行为的写法. (常规写法 return false 是不行的!!!) */
                let new_score = event.target.innerText.trim();    /* 以下完全照搬 onBlur 的事件处理 */
                event.target.innerText = new_score;
                if (isValidScore(new_score)) {
                  props.changeScoreOfCourse(props.courseInfo.unique_id, new_score);
                } else {
                  event.target.innerText = props.courseInfo.original_score;
                  props.changeScoreOfCourse(props.courseInfo.unique_id, props.courseInfo.original_score);
                }
              }
            }
          }
        > {props.courseInfo.score} </span>
        <span className={"down"}> {score2gpa_printable(props.courseInfo.score)} </span>
      </span>
    </div>
  );
}


/* ------------------------------ 总结 ------------------------------ */
function Summary(props) {

  // 计算 ｢总绩点｣、｢总学分数｣ 和 ｢总课程数｣ (退课、挂科的不算在内!)
  const total_credits = props.courseInfos
    .filter(d=>d.score !== "W" && d.score !== "F" && d.score !== "NP" && (isNaN(Number(d.score)) || Number(d.score) >= 60))
    .map(d=>d.credit)
    .reduce((a, b) => a + b, 0);
  const num_courses = props.courseInfos.length;
  const avg_gpa = calcAvgGPA(props.courseInfos);

  // 计算每个学期的 ｢绩点｣ 和 ｢累计绩点｣
  const semester_infos = coursesGroupBySemester(props.courseInfos);
  const all_semester = semester_infos.map(info => info.semester);
  // ｢绩点｣
  let all_gpa = all_semester.map(([year, which]) => calcAvgGPA(props.courseInfos
    .filter(i => (i.semester[0] === year && i.semester[1] === which))
  ));
  // ｢累计绩点｣
  let all_accumulatedGPA = all_semester.map(([year, which]) => calcAvgGPA(props.courseInfos
    .filter(i => ((i.semester[0] < year) || (i.semester[0] === year && i.semester[1] <= which)))
  ));
  // console.log("所有课程:", semester_infos);
  // console.log("学期名:", all_semester);
  // console.log("绩点:", all_gpa);
  // console.log("累计绩点:", all_accumulatedGPA);
  return (
    <div id={"summary"}>
      <SemesterRow semesterInfo={{
        total_credits,
        num_courses,
        avg_gpa,
        semester_name: "总绩点",
      }}/>
      <div>
        <table id={"summary-table"}>
          <thead>
            <tr><th>学期</th><th>当期绩点</th><th>累计绩点</th></tr>
          </thead>
          <tbody>
            {[...Array(all_semester.length).keys()].map(i =>
              <tr key={i}>
              <td style={{ backgroundColor: "#dfd"}}> {`${all_semester[i][0]}年第${all_semester[i][1]}学期`}</td>
              <td style={{ backgroundColor: hsl2hslprintable(score2hsl(gpa2score(all_gpa[i]))) }}>{ Number.isNaN(all_gpa[i]) ? "-.---" : all_gpa[i].toFixed(3) }</td> {/* 如果是 NaN, 则更友好地显示为 -.--- */}
              <td style={{ backgroundColor: hsl2hslprintable(score2hsl(gpa2score(all_accumulatedGPA[i]))) }}>{ Number.isNaN(all_accumulatedGPA[i]) ? "-.---" : all_accumulatedGPA[i].toFixed(3) }</td> {/* 如果是 NaN, 则更友好地显示为 -.--- */}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}


/* ------------------------------ ｢添加课程｣ 弹窗 ------------------------------ */
function AddCourseModal(props) {
  const hintYear = String(nowSemester()[0]).padStart(2, "0");
  const hintWhich = nowSemester()[1];

  const [hintName, setHintName] = useState(random_course_name());
  const [hintCredit, setHintCredit] = useState(random_credit());
  const [hintScore, setHintScore] = useState(random_score());

  return (
    <div id={"add-course-modal"} className={"modal"}>
      <div id={"add-course"}>
        <div style={{fontSize: "1.2rem", fontWeight: "bold"}}> 添加一门课程 </div><br></br>
        <div id={"add-course-inputs"}>
          <strong>学年: </strong> <input defaultValue={hintYear}/> <span className={"hint"}>（00, 01, ..., 99）</span><br/>
          <strong>学期: </strong> <input defaultValue={hintWhich}/> <span className={"hint"}>（1, 2, 3）</span><br/>
          <strong>课名: </strong> <input defaultValue={hintName} key={hintName}/> <span className={"hint"}> </span><br/>
          <strong>学分: </strong> <input defaultValue={hintCredit} key={hintCredit}/> <span className={"hint"}>（≥ 1 的整数）</span><br/>
          <strong>成绩: </strong> <input defaultValue={hintScore} key={hintScore}/> <span className={"hint"}>（如：59，84，P，W，...）</span><br/>
        </div>

        <Button name={"✅ 确认添加"} onClick={() => {
          // 判断输入是否合法
          let input_elems = document.querySelectorAll("#add-course-inputs > input");
          let [year, which, name, credit, score] = [...input_elems].map(elem => elem.value);
          // console.log(year, which, name, credit, score);
          const is_year_valid = year => (year !== "" && Number.isInteger(Number(year)) && Number(year) >= 0 && Number(year) <= 99);
          const is_which_valid = which => (Number.isInteger(Number(which)) && Number(which) >= 1 && Number(which) <= 3);
          const is_name_valid = name => (name.length > 0);
          const is_credit_valid = credit => (Number.isInteger(Number(credit)) && Number(credit) >= 1);
          const is_score_valid = isValidScore;

          // 如果合法, 则添加课程, 并关闭提示框
          if (is_year_valid(year) && is_which_valid(which) && is_name_valid(name) && is_credit_valid(credit) && is_score_valid(score)) {
            document.getElementById("add-course-error-msg").innerText = "";
            props.addCourse({
              is_user_created: true,
              unique_id: nextUniqueId(),
              name,
              semester: [Number(year), Number(which)],
              credit: Number(credit),
              score,
              original_score: score,
              type: "unknown",
              teacher: "[自行添加的课程]"
            });
            props.closeModal();

            // 更新下一次提示的默认值
            console.log("更新提示的默认值~");
            setHintName(random_course_name());
            setHintCredit(random_credit());
            setHintScore(random_score());
          }
          else {
            document.getElementById("add-course-error-msg").innerText = "⚠️ 输入内容有误, 请检查后重试~";
          }
        }}/>

        <Button name={"❌ 取消添加 (Esc)"} onClick={props.closeModal}/>
        
        <span id={"add-course-error-msg"} style={{color: "#faa", textShadow: "0 0 0.5rem #faa4"}}>️ </span>
      </div>
    </div>
  );
}



class App extends Component{

  constructor(props) {
    super(props);
    this.state = {
      need_initial_import: true,
      course_infos: null,
    }
  }

  componentDidMount() {

    // 如果检测到 localStorage 中有 user_token, 则按照这个加载数据
    const local_saved_token = localStorage.getItem("user_token");
    if (local_saved_token !== null) {
      localStorage.removeItem("user_token");
      fetchCourseInfoAll(local_saved_token, (infos) => {
        if (window.confirm("检测到您上次的 token 信息, 是否以此身份继续?")) {
          this.setState({
            course_infos: infos,
            need_initial_import: false,
          });
          localStorage.setItem("user_token", local_saved_token);
        }
      });
    }

    /* 点击其它地方时关闭 Modal */
    const modal = document.getElementsByClassName("modal")[0];
    window.onclick = event => {
      if (event.target === modal) {
        this.closeAddCourseModal();
      }
    }

    /* 快捷键 */
    window.addEventListener("keydown", (evt) => {
      // console.log(evt);
      /* 快捷键 F1 请求重新导入 */
      if (evt.key === "F1" && !this.state.need_initial_import) {
        this.handleReImport();
      }
      /* 快捷键 F2 开启/关闭添加课程界面 */
      if (evt.key === "F2" && !this.state.need_initial_import) {
        this.toggleAddCourseModal();
      }
      /* 快捷键 F3 随机生成一张成绩单 */
      if (evt.key === "F3") {
        this.handleRandomGenerate();
      }
      /* 快捷键 Esc 关闭添加课程界面 */
      if (evt.key === "Escape") {
        this.closeAddCourseModal();
      }
    });

  }

  /* 清空 ｢粘贴区域｣ 中的内容 */
  clearPasteArea = () => {
    let paste_area = document.getElementById("paste-here");
    paste_area.innerHTML = "";
  }

  /* 当用户点击 ｢重新导入｣ 按钮时的行为 */
  handleReImport = () => {
    if (window.confirm("确定要返回吗? 您将丢失所有的修改!")) {
      // this.setState({ need_initial_import: true }); // 不用这个了..
      window.location.reload(); // 直接简单粗暴刷新页面得了...
    }
  }

  /* 当用户点击 ｢添加课程｣ 按钮时的行为 */
  handleNewCourse = () => {
    this.openAddCourseModal();
  }

  /* 当用户点击 ｢创建空成绩单｣ 按钮时的行为 */
  handleCreateBlank = () => {
    if (this.state.need_initial_import || window.confirm("您确定要创建一份空白的成绩单吗? 这将丢失您当前页面的所有修改!")) {
      this.setState({
        course_infos: [],
        need_initial_import: false,
      });
    }
  }

  /* 当用户点击 ｢随机生成｣ 按钮时的行为 */
  handleRandomGenerate = () => {
    if (this.state.need_initial_import || window.confirm("您确定要随机生成一份成绩单吗? 这将丢失您当前页面的所有修改!")) {
      let infos = randomGenerateSomeCourseInfo();
      this.setState({
        course_infos: infos,
        need_initial_import: false,
      });
    }
  }

  /* 控制 ｢添加课程填写框｣ 的显示/关闭 */
  openAddCourseModal = () => {
    document.getElementById("add-course-modal").style.display = "flex";
  }
  closeAddCourseModal = () => {
    document.getElementById("add-course-modal").style.display = "none";
  }
  toggleAddCourseModal = () => {
    const modal = document.getElementById("add-course-modal");
    modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
  }

  /* 向自己维护的课程列表中添加一门新的课程 */
  addACourse = (new_course) => {
    this.setState({ course_infos: [new_course, ...this.state.course_infos] })
  }

  /* 当用户向 ｢粘贴区域｣ 粘贴时的行为 */
  handlePaste = (evt) => {
    console.log("用户粘贴了一些东西, 来看看能不能解析?");
    let elem = evt.target;              // 这个理应就是 #paste-here
                                        // 判断 ｢导入方式｣

    const inner_text = elem.innerText.trim();
    if (false &&  // fixme: qy 树洞已经不存在以前 PKU Helper 时代的 token 了，新的 token 规则本人并不知晓。——2024-06-22 注
      seemsLikeToken(inner_text)) { // 1. 粘贴的是 ｢token｣ 类似物
      const token = inner_text;
      fetchCourseInfoAll(token, (infos) => {
        console.log("utils:", infos);
        console.log("gpa:", calcAvgGPA(infos));
        this.setState({
          course_infos: infos,
          need_initial_import: false,
        });
        localStorage.setItem("user_token", token);     // 存储用户的 token, 下次如果检测到 localStorage 中有, 就不必再向用户询问
      });
    }
    else if (seemsByPageCopy(elem)) {   // 2. 粘贴的是 ｢成绩查询页面｣ 类似物
      let infos = parseCourseInfoAll(elem);
      console.log("utils:", infos);
      console.log("gpa:", calcAvgGPA(infos));
      this.setState({
        course_infos: infos,
        need_initial_import: false,
      });
    }
    else {
      alert("无法识别您粘贴的内容w 请仔细阅读 [导入指南] 后重试🥺")
    }

    this.clearPasteArea();
    console.log("用户粘贴的内容已清空~");
  }

  /* 把 unique_id 为 ui 的 course 的成绩设置为 new_score */
  changeScoreOfCourse = (ui, new_score) => {
    let infos =  this.state.course_infos;
    let that_info = infos.filter(i => i.unique_id === ui)[0];
    that_info.score = new_score;
    this.setState({
      course_infos: [that_info, ...infos.filter(i => i.unique_id !== ui)],
    });
  }

  render() {
    return (
      <>
        <TitleBar/>
        {this.state.need_initial_import || <Settings
          onClickImport={this.handleReImport}
          onNewCourse={this.handleNewCourse}
          onRandomGenerate={this.handleRandomGenerate}
        />}
        <AddCourseModal
          addCourse={this.addACourse}
          closeModal={this.closeAddCourseModal}
        />
        {this.state.need_initial_import
          ? <Importer onPaste={this.handlePaste}
                      onCreateBlank={this.handleCreateBlank}
                      onRandomGenerate={this.handleRandomGenerate}/>
          : <>
            <GradeBook courseInfos={this.state.course_infos}
                       changeScoreOfCourse={this.changeScoreOfCourse}/>
            <Summary courseInfos={this.state.course_infos}/>
          </>}
        <br/>
        <BottomBar/>
      </>
    );
  }
}


export default App;

