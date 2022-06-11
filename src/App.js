import "./App.css";
import { Component } from "react";
import import_icon from "./icons/import.svg";
import warning_icon from "./icons/warning.svg";
import add_icon from "./icons/add.svg";

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
    <span className="settings-button">
      <img src={props.icon} alt="import-icon" width="16" height="16" style={{marginRight: ".2rem"}}></img>
      <span> {props.name} </span>
    </span>
  )
}


function Settings() {
  return (
    <div id={"settings"}>
      <Button name={"重新导入"} icon={import_icon}/>
      <Button name={"编辑警告"} icon={warning_icon}/>
      <Button name={"新建课程"} icon={add_icon}/>
    </div>
  )
}


class Importer extends Component {
  render() {
    return (
      <div> This is Importer  </div>
    );
  }
}


class GradeBook extends Component {
  render() {
    return (
      <div> This is Grade Book </div>
    );
  }
}


class Summary extends Component {
  render() {
    return (
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

  render() {
    return (
      <>
        <TitleBar/>
        <Settings/>
        {this.state.need_initial_import
          ? <Importer/>
          : <><GradeBook/><Summary/></>}
        <BottomBar/>
      </>
    );
  }
}


export default App;

