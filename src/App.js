import "./App.css";

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






function App() {
  return (
    <>
      <TitleBar/>
      <BottomBar/>

    </>
  )
}


export default App;

