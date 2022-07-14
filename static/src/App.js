import './App.css';
import {useRef,useState,useEffect} from 'react'
import instance from './util/instance';
import SparkMD5 from 'spark-md5'
function App() {
  const upload_ipt = useRef();
  const upload_ipt2 = useRef();
  const upload_ipt3 = useRef();
  const [upload_tip,setTip] = useState("block");
  // const [upload_list,setFileList] = useState("none")
  const [_file,setFile] = useState([]);
  const [_file2,setFile2] = useState([]);
  //   缩略图是否显示
  const [abber,setabber] = useState({
    imgSrc:"",
    isShow:'none'
  })
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


//   base64的传输
  const changeBase64 = (file) => {
        return new Promise((resolve) => {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = (e) => {
                resolve(e.target.result);
            };
        });
  };
    // 监听用户选择文件的操作
  const handInputchange2 = async () => {
        // 获取用户选择的文件
        
        let file = upload_ipt2.current.files[0];
        console.log({file,upload_ipt2})
        let base64 = null;
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

        // 将上传的文件转成base64
        base64 = await changeBase64(file);
        upload_ipt2.current.value = '';
        console.log(base64);
        try {
            const data = await instance.post(
                '/upload_single_base64',
                {
                    file: encodeURIComponent(base64), // 防止乱码问题
                    filename: file.name,
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const { code } = data;
            if (code === 0) {
                alert('文件上传成功!');
            }
            throw data.codeText; // 抛出异常
        } catch (e) {
            // 文件上传错误
        } finally {
            //
        }
  }

    //   缩略图上传
    const handInputchange3 =  async () => {
              // 获取用户选择的文件
              let file = upload_ipt3.current.files[0];
              console.log({file,upload_ipt3})
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
      
              // 文件预览,将文件对象转成base64赋值给img-url
              const base64 = await changeBase64(file);
              setFile2([file]) 
              console.log(base64);
              setabber({
                imgSrc:base64,
                isShow: 'block'
              })
    }
       /**
     *
     * @param {} file
     * @returns
     * 根据内容生成hash名字
     */
    const changeBuffer = (file) => {
        return new Promise((resolve) => {
            let fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = (e) => {
                let buffer = e.target.result;
                console.log(buffer);
                const spark = new SparkMD5.ArrayBuffer();
                spark.append(buffer);
                const HASH = spark.end();
                const suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1];
                console.log(HASH);
                resolve({
                    buffer,
                    HASH,
                    suffix,
                    filename: `${HASH}.${suffix}`,
                });
            };
        });
    };

    const handeSend2 = async () => {
        if (!_file2) return alert('请选择图片');
        // 将文件传给服务器 FormData / base64
        console.log({_file2});
        // 生成文件buffer名字
        const { filename } = await changeBuffer(_file2[0]);

        let formData = new FormData();
        formData.append('filename', filename); // 处理名字,服务端不提供名字编译
        instance
            .post('/upload_single_name', formData)
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
      <div className="item">
          <h3>单一文件上传 [BASE64]</h3>
          <section id="upload2">
              <input
                  type="file"
                  accept=".png,.jpg"
                  className="upload_ipt"
                  style={{display: "none" }}
                  onChange={handInputchange2}
                  ref={upload_ipt2}
              />
              <div>
                  <button className="upload_button select" onClick={()=>{
                    upload_ipt2.current.click()
                  }}>
                      选择图片上传
                  </button>
              </div>
          </section>
      </div>

      <div className="item">
          <h3>单一文件上传 [缩略图]</h3>
          <section id="upload3">
              <input
                  type="file"
                  accept=".png,.jpg"
                  className="upload_ipt"
                  style={{display: "none" }}
                  ref={upload_ipt3}
                  onChange={handInputchange3}
              />
              <div>
                  <button className="upload_button select"
                  onClick={()=>{
                    upload_ipt3.current.click()
                  }}
                  >选择文件</button>
                  <button className="upload_button upload" onClick={handeSend2}>
                      上传到服务器
                  </button>
              </div>
              <div className="upload_abber">
                  <img
                  src={abber.imgSrc}
                  alt=""
                  style={{
                  width: '100px', 
                  height: '100px', 
                  display: abber.isShow}}
                  />
              </div>
          </section>
      </div>

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
