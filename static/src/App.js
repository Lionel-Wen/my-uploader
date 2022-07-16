import './App.css';
import {useRef,useState,useEffect} from 'react'
import instance from './util/instance';
import SparkMD5 from 'spark-md5'
import {createRandom} from './util/utilFunc'
function App() {
  const upload_ipt = useRef();
  const upload_ipt2 = useRef();
  const upload_ipt3 = useRef();
  const upload_ipt4 = useRef();
  const upload_input5 = useRef();
  const upload_list = useRef();
  const upload_ipt6 = useRef();
  const dragBox = useRef();
  const [upload_tip,setTip] = useState("block");
  // const [upload_list,setFileList] = useState("none")
  const [_file,setFile] = useState([]);
  const [_file2,setFile2] = useState([]);
  //   缩略图是否显示
  const [abber,setabber] = useState({
    imgSrc:"",
    isShow:'none'
  })

//   多文件上传
  const [files,setFiles] = useState([])
  
  const [progressONe,setPro] = useState({
    isShowPro:'none',
    proLength:0
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


  useEffect(()=>{
   console.log({files})
  },[files])

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
    .post('/upload/upload_single', formData)
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
        console.log({base64});
        try {
            const data = await instance.post(
                '/upload/upload_single_base64',
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
        console.log("file2",_file2[0]);
        // 生成文件buffer名字
        const { filename } = await changeBuffer(_file2[0]);
        
        let formData = new FormData();
        formData.append('filename', filename); // 处理名字,服务端不提供名字编译
        instance
            .post('/upload/upload_single_name', formData)
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

    const handleDown = () => {
        console.log(111111111)
        instance
        .post('/download/file', "hello")
        .then((res) => {
            const { code } = res;
            if (code === 0) {
                console.log(res.codeText)
            }
            console.log(res);
            return Promise.reject(res.codeText);
        })
        .catch((e) => {
            console.log(e);
        });    
    }

    // 进度条控制
    const handInputchange4 = async () => {
        console.log(upload_ipt4.current.files, '???');

        let file = upload_ipt4.current.files[0];
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
        if (file.size > 10 * 1024 * 1024) {
            alert('上传文件不能超过2MB');
            return;
        }

        try {
            let formData = new FormData();
            formData.append('file', file);
            formData.append('filename', file.filename);
            const data = await instance.post('/upload/upload_single', formData, {
                onUploadProgress: (e) => {
                    console.log(e);
                    const { loaded, total } = e;
                    console.log(
                        `${(loaded / total) * 100}%`,
                        ' `${loaded/total*100}%`'
                    );
                    setPro({
                        isShowPro:'block',
                        proLength:`${
                            (loaded / total) * 100
                        }`
                    })
                },
            });
            const { code } = data;
            if (code === 0) {
                setPro({
                    ...progressONe,
                    proLength:'100'
                })
            } else {
                throw data.codeText;
            }  
        } catch (e) {
            //
            console.log(e);
            alert('文件上传失败');
        } finally {
            // this.value = '';
        }
    }

    const handleChange5 = async () => {
        // 获取用户选择的文件
        console.log(upload_input5.current.files)
        let files = Array.from(upload_input5.current.files);
        console.log('files2222s',files)
        files = files.map((file) => {
            return {
                file,
                filename: file.name,
                key: createRandom(),
            };
        });
        console.log('filesss',files)
        setFiles(files);
    }

    const deleteList = (e) => {
        const target = e.target;
        if (target.tagName === 'EM') {
            console.log('okxxx');
            const curli = target.parentNode.parentNode;
            if (!curli) {
                return;
            }
            console.log(curli)
            const keyName = curli.getAttribute('keyName');
            // upload_list.removeChild(curli); // 移除元素
            console.log(keyName)
            const newfiles = files.filter((item) => item.key !== keyName);
            setFiles(newfiles);
            // console.log(newfiles);
        }
    }

    const handSend3 = async () => {
        if (files.length === 0) {
            return alert('请选择文件');
        }
        /**
         *
         * 循环发送请求
         */
        // const upload_list_arr = Array.from(upload_list.querySelectorAll('li'));
        // console.log({upload_list_arr})
        const _files = files.map((item) => {
            const fm = new FormData();
            // const curLi = upload_list_arr.find(
            //     (liBox) => liBox.getAttribute('key') === item.key
            // );
            // const curSpan = curLi
            //     ? curLi.querySelector('span:nth-last-child(1)')
            //     : null;
            fm.append('file', item.file);
            fm.append('filename', item.filename);
            return instance
                .post('/upload/upload_single', fm, {
                    onUploadProgress(e) {
                        // 监听每一个上传进度
                        // const { loaded, total } = e;
                        // const progress = `${((loaded / total) * 100).toFixed(
                        //     2
                        // )}%`;
                        // if (curSpan) {
                        //     curSpan.innerText = progress;
                        // }
                    },
                })
                .then((data) => {
                    const { code } = data;
                    if (code === 0) {
                        // if (curSpan) {
                        //     curSpan.innerText = '100%';
                        // }
                        // return Promise.resolve(data);
                    } else {
                        return Promise.reject(data.codeText);
                    }
                    
                });
        });
        Promise.all(_files).then((res) => {
            console.log(res);
            alert('上传成功');
        });
    } 


    // 拖拽上传
    const uploadFile = (file) => {
        if (!file) return;
        // 将文件传给服务器 FormData / base64
        let formData = new FormData();
        formData.append('file', file);
        formData.append('filename', file.name);
        instance
            .post('/upload/upload_single', formData)
            .then((res) => {
                const { code } = res;
                if (code === 0) {
                    alert('file 上传成功');
                    // return;
                } else {
                    console.log(res);
                    return Promise.reject(res.codeText);
                }

            })
            .catch((e) => {
                console.log(e);
            });
    };

    const handleDragEnter = (e) => {
      console.log(e);
      e.preventDefault();
    }

    const handeChange6 = (e) => {
        const { files } = e.target;
        const file = files[0];
        _file = file;
    }

    const handSend5 = async () => {
        // 点击开始上传
        let chunkList = [];
        let alreadyChunkList = [];
        console.log(_file);
        let maxSize = 1024 * 1024;
        let maxCount = Math.ceil(_file.size / maxSize); // 最大允许分割的切片数量为30
        let index = 0;
        if (!_file) return alert('请先选择图片');
        const { HASH, suffix } = await changeBuffer(_file);
        // 判断当前文件可以切出多少切片
        if (maxCount > 10) {
            // 如果切片数量大于最大值
            maxSize = _file.size / 10; // 则改变切片大小
            maxCount = 10;
        }
        console.log(maxCount, 'maxCount');
        console.log(maxSize, 'maxSize');
        while (index < maxCount) {
            chunkList.push({
                file: _file.slice(index * maxSize, (index + 1) * maxSize),
                filename: `${HASH}_${index + 1}.${suffix}`,
            });
            index++;
        }

        // 先获取已经上传的切片
        const data = await instance.post(
            '/upload_already',
            {
                HASH: HASH,
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        index = 0
        const complate = async () => {
            index++;
            let progress = `(${index}/${maxCount})%` // 进度条
            if (index >= maxCount) {
                console.log('ok, 切片完成')
            }
        }

        const { fileList } = data;
        alreadyChunkList = fileList
        console.log(chunkList, 'chunkList');
        chunkList = chunkList.map((item) => {
            if (alreadyChunkList.length > 0 && alreadyChunkList.includes(item.filename)) {
                debugger
                // 表示切片已经存在
                complate()
                return;
            }

            const fm = new FormData();
            fm.append('file', item.file);
            fm.append('filename', item.filename);
            return new Promise((sovle) => {
                instance
                    .post('/upload_chunk', fm)
                    .then(() => {
                        complate()
                        sovle();
                    })
                    .catch(() => {
                        //
                    });
            });
        });
        Promise.all(chunkList).then(() => {
            instance
                .post(
                    '/upload_merge',
                    {
                        HASH: HASH,
                        count: maxCount,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                )
                .then((res) => {
                    console.log('ok');
                });
        });
    }

  return (
    <div className="container">
      <div className="item">
        <button onClick={()=>{handleDown()}}>测试download接口</button>
      </div> 
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

      <div className="item">
          <h3>单一文件上传 [进度条管控]</h3>
          <section id="upload4">
              <input
                  type="file"
                  accept=".png,.jpg"
                  className="upload_ipt"
                  style={{display: "none" }}
                  ref={upload_ipt4}
                  onChange={handInputchange4}
              />
              <div>
                  <button className="upload_button select" onClick={()=>{
                     upload_ipt4.current.click();
                  }}>选择文件</button>
              </div>
              <div className="upload_progress" style={{display:progressONe.isShowPro}}>
                  <div className="progress" style={{
                    width:`${progressONe.proLength}%`
                  }}></div>
              </div>
          </section>
      </div>

      <div className="item">
          <h3>多文件上传 [FORM-DATA]</h3>
          <section id="upload5">
              <input
                  type="file"
                  accept=".png,.jpg"
                  multiple
                  className="upload_ipt"
                  style={{display: "none" }}
                  onChange={handleChange5}
                  ref={upload_input5}
              />
              <div>
                  <button className="upload_button select" onClick={()=>{
                    upload_input5.current.click();
                  }}>选择文件</button>
                  <button className="upload_button upload" onClick={()=>{
                    handSend3()
                  }}>
                      上传到服务器
                  </button>
              </div>
              <ul className="upload_list" onClick={(e)=>{deleteList(e)}} ref={upload_list}>
                {
                    files.map((item,index) => { 
                      console.log({item})
                      return (
                        <li key={item.key} keyName={item.key}>
                        <span>${index + 1} : ${item.filename}</span>
                        <span><em>删除</em></span>
                        </li>
                      )
                    })
                }
              </ul>
          </section>
      </div>

      <div className="item" id="dragBox"
         onDragEnter = {handleDragEnter}
         onDragLeave = {(e)=>{
            console.log(2222)
         }}
         onDrop = {(e)=>{
            e.preventDefault();
            // this.style.border = '';
            const {
                dataTransfer: { files },
            } = e;
            const file = files[0];
            console.log({file})
            uploadFile(file);
         }}
      >
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
                      >点击上传
                  </span>
              </div>
          </section>
      </div>

      <div className="item">
          <section id="upload7">
              <h3>大文件上传 [FORM-DATA]</h3>
              <input
                  type="file"
                  className="upload_ipt"
                  style={{display: "none" }}
                  ref={upload_ipt6}
                  onChange={handeChange6}
              />
              <div>
                  <button className="upload_button select" onClick={()=>{
                    upload_ipt6.current.click()
                  }}>选择文件</button>
                  <button className="upload_button upload" onClick={handSend5}>开始上传</button>
              </div>
              <div className="upload_progress">
                  <div className="progress"></div>
              </div>
          </section>
      </div>
    </div>
  )
}

export default App;
