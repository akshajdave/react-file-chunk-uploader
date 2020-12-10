
import './App.css';
// import fs from 'fs';
import { Component } from 'react';
import { computeHeadingLevel } from '@testing-library/react';

const axios = require('axios').default

export default class App extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      reader: new FileReader(),
      chunkSize: 10 * 1024,
      chunksQueue: [],
      fileArray: []
    }
    
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.sendNext = this.sendNext.bind(this);
    this.upload = this.upload.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    // console.log(this.state.fileArray.length);

    const files = this.state.fileArray;
    let file;

    for(let i = 0; i < files.length; i++) {
      file = files.item(i);
      
      this.prepare(file, i + 1);

    }
    
  }

  prepare(file, fileId) {
    
    const chunkSize = this.state.chunkSize;
    const chunksQuantity = Math.ceil(file.size / chunkSize);

    let chunksQueue = new Array(chunksQuantity).fill().map((_, index) => index).reverse();

    this.setState({
        chunksQueue: chunksQueue
    });
    
    // console.log(`Starting upload ${chunksQueue}`);
    this.sendNext(chunksQueue, chunksQuantity, fileId);
  }

  sendNext(chunksQueue, chunksQuantity, fileId) {
    
    if(!chunksQueue.length) {
        console.log('All parts uploaded');
        return;
    }

    const chunkSize = this.state.chunkSize;
    const file = this.state.fileArray[fileId-1];
    const chunkId = chunksQueue.pop();

    // console.log(`${chunksQueue}`);

    const begin = chunkId * chunkSize;
    const chunk = file.slice(begin, begin + chunkSize);

    this.upload(chunk, chunkId, chunksQuantity, fileId)
    .then(() => {
        this.sendNext(chunksQueue, chunksQuantity, fileId);
    })
    .catch(() => {
        // chunksQueue.push(chunkId);
    });
  }

  upload(chunk, chunkId, chunksQuantity, fileId) {
      // console.log(chunk, chunkId);
      
      const file = this.state.fileArray[fileId - 1];

      /*
      return new Promise((resolve, reject) => {
          if (1 === 1) resolve();
          else reject();
      });
      */

      return new Promise((resolve, reject) => {

        const url = 'http://localhost:5000/upload/chunk';

        console.log(chunk.size, chunksQuantity);

        // XHR

        /*
        const xhr = new XMLHttpRequest();
        xhr.open("post", url);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.setRequestHeader("X-Chunk-Id", chunkId);
        xhr.setRequestHeader("X-File-Id", fileId);
        xhr.setRequestHeader("X-Chunks-Quantity", chunksQuantity);
        // xhr.setRequestHeader("Content-Length", chunk.size);
        xhr.setRequestHeader("X-Content-Name", file.name);
        xhr.setRequestHeader("X-Content-Length", file.size);
  
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4 && xhr.status === 200) {
                
                resolve();
            }
        };
        
        xhr.onerror = reject;
        xhr.send(chunk);

        */


        // Axios

        axios({
          method: 'post',
          url: '/upload/chunk',
          baseURL: 'http://localhost:5000/',
          // Need a way to add these to the product
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          data: chunk,
          params: {
            'chunkId': chunkId,
            'fileId': fileId,
            'chunksQuantity': chunksQuantity,
            'fileName': file.name,
            'fileSize': file.size
          }
        
        }).then(res => {
          resolve()
        }).catch(err => {
          reject()
        })
        
      });
      
  }


  onChange(e) {
    // console.log(e.target.files[0]);
    this.setState({
      fileArray: e.target.files
    });
  }



  render() {
    return (

      <div className="App">

        <section>
          
          <form onSubmit={this.onSubmit} id="stream-single-form">
          <h1>File Upload - Single (Chunking)</h1>
            <input type="file" id="single-file-stream" name="single-file-stream" onChange={this.onChange} />
            <input type="submit" />
          </form>

          <form onSubmit={this.onSubmit} encType="multipart/form-data" id="chunk-multiple-form">
            <h1>File Upload - Multiple (Chunking)</h1>
            <input type="file" id="multiple-file-chunk" name="multiple-file-chunk" multiple onChange={this.onChange} />
            <input type="submit" />
          </form>

        </section>

      </div>
    );
  }
}



  
