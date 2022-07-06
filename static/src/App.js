import './App.css';
import {useRef,useState,useEffect} from 'react'
import instance from './util/instance';
function App() {
  const upload_ipt = useRef();
  const [upload_tip,setTip] = useState("block");
  // const [upload_list,setFileList] = useState("none")
  const [_file,setFile] = useState([])
//  const [FileList,setFileList] = useState([]);
  const handleDeleteList = (e) => {
    let target = e.target;
    // 事件委托, 提高页面性能
    if (target.tagName === 'EM') {
        // 点击的是移除按钮
        setTip("block")
        setFile([])
        // _file = null;
    }
  }
  
  useEffect(()=>{
   console.log({_file})
   return () => {
    console.log("组件卸载")
   }
  },[_file])

  const handInputchange = () => {
          // 获取用户选择的文件
          let file = upload_ipt.current.files[0];
          console.log({file});
          /**
           * + name 文件名
           * + size 文件大小 B字节
           * + type 文件类型
           */
          if (!file) return;
          // 方案1: 限制文件上传的格式
          if (!/(png|jpg|jpeg)/i.test(file.type)) {
              alert('上传文件格式不正确');
          }
          // 限制文件上传的大小
          if (file.size > 2 * 1024 * 1024) {
              alert('上传文件不能超过2MB');
              return;
          }
          setTip("none")
          setFile([file])
          // 事件委托,依托事件冒泡机制
  }

  const handeSend = () => {
    console.log({_file});
    if(!_file) {
      return alert("请上传文件")
    }
    let formData = new FormData();
    for (let item in _file) {
        console.log({item})
      formData.append('file', _file[item]);
      formData.append('filename', _file[item].name);
    }
    console.log({formData})
    instance
    .post('/upload_single', formData)
    .then((res) => {
        const { code } = res;
        if (code === 0) {
            alert('file 上传成功');
            return;
        }
        console.log(res);
        return Promise.reject(res.codeText);
    })
    .catch((e) => {
        console.log(e);
    });
  }
  return (
    <div className="container">
      <div className="item">
        <div className="title">单一文件上传FORM_DATA</div>
        <section id="upload1">
            <input
                type="file"
                accept=".png,.jpg"
                className="upload_ipt"
                style={{display: "none" }}
                ref={upload_ipt}
                onChange = {handInputchange}
            />
            {/* <!-- 自己文件的按钮,来触发选择图片 --> */}
            <div>
                <button className="upload_button select"onClick={()=>{
                  console.log("上传文件", upload_ipt.current.files);
                  upload_ipt.current.click()
                  }}>选择文件</button>
                <button className="upload_button upload" onClick={handeSend}>
                    上传到服务器
                </button>
            </div>
            <div className="upload_tip" style={{display:upload_tip}}>大小不能超过2MB</div>
            <ul className="upload_list" onClick={ (e) => {
              handleDeleteList(e)
            }} >
            {
              _file !== [] &&  _file.map(item => {
                return (
                  <li key={item.name}>
                      <span>文件: {item.name}</span>
                      <span><em>移除</em></span>
                  </li>
                )
                
              })
            }
            </ul>
        </section>
      </div>
      {/* <div className="item">
          <h3>单一文件上传 [BASE64]</h3>
          <section id="upload2">
              <input
                  type="file"
                  accept=".png,.jpg"
                  className="upload_ipt"
                  style={{display: "none" }}
              />
              <div>
                  <button className="upload_button select">
                      选择图片上传
                  </button>
              </div>
          </section>
      </div> */}

      {/* <div className="item">
          <h3>单一文件上传 [缩略图]</h3>
          <section id="upload3">
              <input
                  type="file"
                  accept=".png,.jpg"
                  className="upload_ipt"
                  style={{display: "none" }}
              />
              <div>
                  <button className="upload_button select">选择文件</button>
                  <button className="upload_button upload">
                      上传到服务器
                  </button>
              </div>
              <div className="upload_abber">
                  <img
                  src=""
                  alt=""
                  style={{
                  width: '100px', 
                  height: '100px', 
                  display: 'none'}}
                  />
              </div>
          </section>
      </div> */}

      {/* <div className="item">
          <h3>单一文件上传 [进度条管控]</h3>
          <section id="upload4">
              <input
                  type="file"
                  accept=".png,.jpg"
                  className="upload_ipt"
                  style={{display: "none" }}
              />
              <div>
                  <button className="upload_button select">选择文件</button>
              </div>
              <div className="upload_progress">
                  <div className="progress"></div>
              </div>
          </section>
      </div> */}

      {/* <div className="item">
          <h3>多文件上传 [FORM-DATA]</h3>
          <section id="upload5">
              <input
                  type="file"
                  accept=".png,.jpg"
                  multiple
                  className="upload_ipt"
                  style={{display: "none" }}
              />
              <div>
                  <button className="upload_button select">选择文件</button>
                  <button className="upload_button upload">
                      上传到服务器
                  </button>
              </div>
              <ul className="upload_list"></ul>
          </section>
      </div> */}

      {/* <div className="item" id="dragBox">
          <h3>拖拽上传 [FORM-DATA]</h3>
          <section id="upload6">
              <input
                  type="file"
                  accept=".png,.jpg"
                  multiple
                  className="upload_ipt"
                  style={{display: "none" }}
              />
              <div className="upload-box">
                  <span>将文件拖到此处,或</span>
                  <span
                      id="upload-button"
                      style={{color: 'rgb(58, 58, 193)',cursor: 'pointer'}}
                      >点击上传</span
                  >
              </div>
          </section>
      </div> */}

      {/* <div className="item">
          <section id="upload7">
              <h3>大文件上传 [FORM-DATA]</h3>
              <input
                  type="file"
                  className="upload_ipt"
                  style={{display: "none" }}
              />
              <div>
                  <button className="upload_button select">选择文件</button>
                  <button className="upload_button upload">开始上传</button>
              </div>
              <div className="upload_progress">
                  <div className="progress"></div>
              </div>
          </section>
      </div> */}
    </div>
  )
}

export default App;
