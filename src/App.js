
import './App.css';
// import fs from 'fs';
import { Component } from 'react';

export default class App extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      file: null,
      reader: new FileReader(),
      chunkSize: 10 * 1024,
      chunksQueue: []
    }
    
    this.onSubmitStream = this.onSubmitStream.bind(this);
    this.onChangeStream = this.onChangeStream.bind(this);
    this.sendNext = this.sendNext.bind(this);
    this.upload = this.upload.bind(this);
  }


  onSubmitStream(e) {
    e.preventDefault();

    const chunkSize = this.state.chunkSize;
    const file = this.state.file;
    const chunksQuantity = Math.ceil(file.size / chunkSize);

    let chunksQueue = new Array(chunksQuantity).fill().map((_, index) => index).reverse();
    this.setState({
        chunksQueue: chunksQueue
    });
    
    // console.log(`Starting upload ${chunksQueue}`);
    this.sendNext(chunksQueue, chunksQuantity);
  }

  sendNext(chunksQueue, chunksQuantity) {
    
    if(!chunksQueue.length) {
        console.log('All parts uploaded');
        return;
    }

    const chunkSize = this.state.chunkSize;
    const file = this.state.file;
    const chunkId = chunksQueue.pop();

    // console.log(`${chunksQueue}`);

    const begin = chunkId * chunkSize;
    const chunk = file.slice(begin, begin + chunkSize);

    this.upload(chunk, chunkId, chunksQuantity)
    .then(() => {
        this.sendNext(chunksQueue, chunksQuantity);
    })
    .catch(() => {
        // chunksQueue.push(chunkId);
    });
  }

  upload(chunk, chunkId, chunksQuantity) {
      // console.log(chunk, chunkId);
      
      const file = this.state.file;

      /*
      return new Promise((resolve, reject) => {
          if (1 === 1) resolve();
          else reject();
      });
      */

      return new Promise((resolve, reject) => {

        const url = 'http://localhost:5000/upload/single-stream';

        console.log(chunk.size, chunksQuantity);

        // XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open("post", url);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.setRequestHeader("X-Chunk-Id", chunkId);
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
      });
      
  }


  onChangeStream(e) {
    // console.log(e.target.files[0]);
    this.setState({
      file: e.target.files[0]
    });
  }



  render() {
    return (

      <div className="App">

        <section>
          
          <form onSubmit={this.onSubmitStream} id="stream-single-form">
          <h1> File Upload - Single (Chunking)</h1>
            <input type="file" id="single-file-stream" name="single-file-stream" onChange={this.onChangeStream} />
            <input type="submit" />
          </form>

        </section>

      </div>
    );
  }
}



  
