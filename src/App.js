import "./App.css";
import { Component } from "react";
import import_icon from "./icons/import.svg";
import warning_icon from "./icons/warning.svg";
import add_icon from "./icons/add.svg";
import {
  seemsByToken, seemsByPageCopy,
  fetchCourseInfoAll, parseCourseInfoAll,
  calcAvgGPA,
} from "./util.js";

function TitleBar() {
  return (
    <div id={"title-bar"}>
      GPA Simulator
    </div>
  );
}

function BottomBar() {
  return (
    <div id={"bottom-bar"}>
      <div> 绩点公式: GPA(x) = 4 - 3(100 - x)² / 1600 </div>
      <div> ️⚠︎ 本页面结果仅供参考, 请以学校官方结果为准! </div>
    </div>
  );
}

function Button(props) {
  return (
    <span className="settings-button" onClick={props.onClick}>
      <img src={props.icon} alt="import-icon" width="16" height="16" style={{marginRight: ".2rem"}}></img>
      <span> {props.name} </span>
    </span>
  )
}


function Settings(props) {
  return (
    <div id={"settings"}>
      <Button name={"重新导入"} icon={import_icon} onClick={props.onClickImport}/>
      <Button name={"隐藏/显示编辑警告"} icon={warning_icon} onClick={props.onToggleEditedWarning}/>
      <Button name={"添加课程"} icon={add_icon} onClick={props.onNewCourse}/>
    </div>
  )
}


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


class GradeBook extends Component {
  render() {
    return (
      /* TODO */
      <div> This is Grade Book </div>
    );
  }
}


class Summary extends Component {
  render() {
    return (
      /* TODO */
      <div> This is Summary  </div>
    );
  }
}



class App extends Component{

  constructor(props) {
    super(props);
    this.state = {
      need_initial_import: true,
      ignore_edited_warning: false,
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
    let elem = evt.target;    // 这个理应就是 #paste-here
    // 判断 ｢导入方式｣
    if (seemsByToken(elem)) {   // 粘贴的是 ｢token｣ 类似物
      /* TODO */
      fetchCourseInfoAll(elem.innerText);
    }
    else if (seemsByPageCopy(elem)) {   // 粘贴的是 ｢成绩查询页面｣ 类似物
      let infos = parseCourseInfoAll(elem);
      console.log("infos:", infos);
      console.log("gpa:", calcAvgGPA(infos));
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
          : <><GradeBook/><Summary/></>}
        <BottomBar/>
      </>
    );
  }
}


export default App;

