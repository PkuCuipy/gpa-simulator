import "./App.css";
import { Component } from "react";
import import_icon from "./icons/import.svg";
import warning_icon from "./icons/warning.svg";
import add_icon from "./icons/add.svg";
import COURSE_INFOS_DEV from "./cuipy-course-info-for-dev.json"
import {
  seemsByToken, seemsByPageCopy,
  fetchCourseInfoAll, parseCourseInfoAll,
  calcAvgGPA,
  score2gpa_printable,
  gpa2score_printable,
} from "./util.js";
import { score2hsl, score2proportion } from "./style";


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
      <div> 绩点公式: GPA(x) = 4 - 3(100 - x)² / 1600 </div>
      <div> ️⚠︎ 本页面结果仅供参考, 请以学校官方结果为准! </div>
    </div>
  );
}

/* ------------------------------ 设置 ------------------------------ */
function Settings(props) {
  return (
    <div id={"settings"}>
      <Button name={"重新导入"} icon={import_icon} onClick={props.onClickImport}/>
      <Button name={"隐藏/显示编辑警告"} icon={warning_icon} onClick={props.onToggleEditedWarning}/>
      <Button name={"添加课程"} icon={add_icon} onClick={props.onNewCourse}/>
    </div>
  )
}

function Button(props) {
  return (
    <span className="settings-button" onClick={props.onClick}>
      <img src={props.icon} alt="import-icon" width="16" height="16" style={{marginRight: ".2rem"}}></img>
      <span> {props.name} </span>
    </span>
  )
}

/* ------------------------------ 导入器 ------------------------------ */
function Importer(props) {
  return (
    <div id={"importer"}>
      <div id={"import-prompt"}>
        😀 请在下方输入框内粘贴以导入您的课程成绩信息:
        <ul>
          <li><div><strong>方式1:</strong> 复制您的 PKU Helper token, 粘贴到下方;</div></li>
          <li><div><strong>方式2:</strong> 全选 PKU Helper 成绩查询页面并复制, 粘贴到下方;</div></li>
        </ul>
      </div>
      <div id={"paste-here"} contentEditable={"true"} onInput={props.onPaste}>
      </div>
    </div>
  );
}

/* ------------------------------ 成绩单 ------------------------------ */
function GradeBook(props) {

  // 把所有课程根据 semester 分组
  const semester_names = [...new Set(props.courseInfos.map(info => info.semester.join("-")))].sort();
  const semester_infos = semester_names.map(sem_name => ({
    semester: sem_name.split("-"),
    course_infos: props.courseInfos.filter(info => info.semester.join("-") === sem_name),
  }));
  // console.log(semester_names);
  // console.log(semesters);

  return (
    <>
      <div id={"grade-book"}>
        {semester_infos.map(info =>
          <SemesterChunk
            courseInfos={info.course_infos}
            semester={info.semester}
            key={info.semester}
          />
        )}
      </div>
    </>
  );
}

function SemesterChunk(props) {
  console.assert(props.courseInfos.length !== 0, "不允许存在不包含课程的学期!");

  // 计算 <SemesterRow> 所需的信息
  const course_infos = props.courseInfos.slice().sort((a, b) => b.score - a.score);    // 分属于这个 Semester 的所有课程信息. 注意 React 禁止修改 props, 所以需要 .slice() 复制一份先.
  const semester_name = `${props.semester[0]}学年 第${props.semester[1]}学期`;
  const num_courses = course_infos.length;
  const total_credits = course_infos.map(d=>d.credit).reduce((a, b) => a + b, 0);
  const avg_gpa = calcAvgGPA(course_infos);

  // 渲染一个 <SemesterRow> + 若干个 <CourseRow>
  return (
    <div className={"semester-chunk"}>
      <SemesterRow semesterInfo={{
        semester_name,
        num_courses,
        total_credits,
        avg_gpa,
      }}/>
      <div class={"rows"}>
        {course_infos.map(info => <CourseRow courseInfo={info} key={info.name}/>)}
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
        <span className={"up"}> {props.semesterInfo.avg_gpa.toFixed(3)} </span>
        <span className={"down"}> (折合 {gpa2score_printable(props.semesterInfo.avg_gpa)}) </span>
    </span>
    </div>
  );
}

function CourseRow(props) {
  // 计算颜色
  let {h, s, l} = score2hsl(props.courseInfo.score);
  let p = score2proportion(props.courseInfo.score);

  return (
    <div className={"course-row"} style={{
      // background: `linear-gradient(to right, rgb(255, 242, 128) 0%, rgb(255, 240, 102) 45%, rgb(219, 209, 112) 45%)`
      background: `linear-gradient(to right, 
                                    hsl(${h}, ${s}%, ${l}%) 0%, 
                                    hsl(${h}, ${s}%, ${l}%) ${p}%, 
                                    hsl(${h}, ${s * 0.8}%, ${l * 1.1}%) ${p}%)`
    }}>
      <span className={"left"}>
        <span className={"up"}> {props.courseInfo.credit} </span>
        <span className={"down"}> 学分 </span>
      </span>
      <span className={"middle"}>
        <span className={"up"}> {props.courseInfo.name} </span>
        <span className={"down"}> {props.courseInfo.teacher} </span>
      </span>
      <span className={"right"}>
        <span className={"up"}> {props.courseInfo.score} </span>
        <span className={"down"}> {score2gpa_printable(props.courseInfo.score)} </span>
      </span>
    </div>
  );
}


/* ------------------------------ 总结 ------------------------------ */
function Summary(props) {
  return (
    /* TODO */
    <>
      <h2> This is Summary </h2>
      <div> {JSON.stringify(props.courseInfos)} </div>
    </>

  );
}



class App extends Component{

  constructor(props) {
    super(props);
    this.state = {
      need_initial_import: true,
      ignore_edited_warning: false,
    }
    this.course_infos = null;

    /* 为了防止开发阶段大量访问 Helper-API 被查水表... */
    this.state.need_initial_import = false;
    this.course_infos = COURSE_INFOS_DEV;
  }

  componentDidMount() {
    // 如果检测到 localStorage 中有 user_token, 则按照这个加载数据
    const local_saved_token = localStorage.getItem("user_token");
    if (local_saved_token !== null) {
      localStorage.removeItem("user_token");
      fetchCourseInfoAll(local_saved_token, (infos) => {
        this.course_infos = infos;
        this.setState({need_initial_import: false});
        localStorage.setItem("user_token", local_saved_token);
      });
    }
  }

  /* 清空 ｢粘贴区域｣ 中的内容 */
  clearPasteArea = () => {
    let paste_area = document.getElementById("paste-here");
    paste_area.innerHTML = "";
  }

  /* 当用户点击 ｢重新导入｣ 按钮时的行为 */
  handleImport = () => {
    console.log("请求重新导入数据");
    this.setState({ need_initial_import: true });
  }

  /* 当用户点击 ｢编辑警告｣ 按钮时的行为 */
  handleToggleEditedWarning = () => {
    console.log(`从 ${this.state.ignore_edited_warning} 切换为 ${!this.state.ignore_edited_warning}`);
    this.setState({ ignore_edited_warning: !this.state.ignore_edited_warning });
  }

  /* 当用户点击 ｢添加课程｣ 按钮时的行为 */
  handleNewCourse = () => {
    /* TODO */
    console.log("请求添加一门新的课程");
  }

  /* 当用户向 ｢粘贴区域｣ 粘贴时的行为 */
  handlePaste = (evt) => {
    console.log("用户粘贴了一些东西, 来看看能不能解析?");
    let elem = evt.target;              // 这个理应就是 #paste-here
                                        // 判断 ｢导入方式｣
    if (seemsByToken(elem)) {           // 1. 粘贴的是 ｢token｣ 类似物
      const token = elem.innerText;
      fetchCourseInfoAll(token, (infos) => {
        console.log("infos:", infos);
        console.log("gpa:", calcAvgGPA(infos));
        this.course_infos = infos;
        this.setState({need_initial_import: false});
        localStorage.setItem("user_token", token);     // 存储用户的 token, 下次如果检测到 localStorage 中有, 就不必再向用户询问
      });
    }
    else if (seemsByPageCopy(elem)) {   // 2. 粘贴的是 ｢成绩查询页面｣ 类似物
      let infos = parseCourseInfoAll(elem);
      console.log("infos:", infos);
      console.log("gpa:", calcAvgGPA(infos));
      this.course_infos = infos;
      this.setState({need_initial_import: false});
    }
    else {
      console.log("无法识别您粘贴的内容w 请仔细阅读说明后重试🥺")
    }

    this.clearPasteArea();
    console.log("用户粘贴的内容已清空~");
  }

  render() {
    return (
      <>
        <TitleBar/>
        <Settings
          onClickImport={this.handleImport}
          onToggleEditedWarning={this.handleToggleEditedWarning}
          onNewCourse={this.handleNewCourse}
        />
        {this.state.need_initial_import
          ? <Importer onPaste={this.handlePaste}/>
          : <>
            <GradeBook courseInfos={this.course_infos}/>
            <Summary courseInfos={this.course_infos}/>
          </>}
        <BottomBar/>
      </>
    );
  }
}


export default App;

