
import './App.css';
// import fs from 'fs';
import { post } from 'axios';
import { Component } from 'react';

export default class App extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      file: null,
      reader: new FileReader(),
      sliceSize: 10 * 1024
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.onSubmitStream = this.onSubmitStream.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeStream = this.onChangeStream.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
  }

  /*
  fileUploadInChunks(file) {

    
    reader.readAsDataURL(file);
    reader.onload = () => {
      data = reader.result;
    };
    
  }
  */ 


  onSubmitStream(e) {
    e.preventDefault();
    this.uploadFile(0);
  }

  uploadFile(start) {
    const slice = this.state.sliceSize;
    const file = this.state.file;
    let reader = this.state.reader;
    
    let nextSlice = start + slice + 1;
    let blob = file.slice(start, nextSlice);
    
    reader.onloadend = (e) => {
      if(e.target.readyState !== FileReader.DONE) {
        console.log('Done');
        return;
      }

      console.log('------------------------');
      console.log(e.target.result);
      console.log('------------------------');
      console.log(e.target.result.size);
      const url = 'http://localhost:5000/upload/single-stream';

      // XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.open("post", url);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      //xhr.setRequestHeader("Content-Length", e.target.result.size);
      xhr.setRequestHeader("X-Content-Name", file.name);
      xhr.setRequestHeader("X-Content-Length", file.size);

      xhr.onreadystatechange = () => {
          if(nextSlice < file.size) {
            this.uploadFile(nextSlice);
          } else {
            console.log('All read');
          }
      };

      xhr.send(e.target.result)

      // AXIOS
      /*
      const formData = new FormData();
      formData.append('file', e.target.result);
      formData.append('fileName', file.name);
      const config = {
        headers: {
          'content-type': 'application/octet-stream'
        }
      }
      post(url, formData, config)
      .then(res => {

      if(nextSlice < file.size) {
        this.uploadFile(nextSlice);
      } else {
        console.log('All read');
      }
      });
      */


    }

    reader.readAsDataURL(blob);
    
  }

  handleClick() {
    const files = document.getElementById('multiple-file').files;
    console.log(files.length);
    /*
    if(files.length > 1) {
      console.log(files[0]);
      const readStream = fs.createReadStream(files[0]);
      readStream.on('error', console.log);
  
      axios({
        method: 'post',
        url: 'http://localhost:5000/upload',
        data: readStream,
        headers: {
          'Content-Type': 'text/markdown'
        }
      }).catch(console.log)
    }
    */
  }

  onSubmit(e) {
      e.preventDefault();
      const formID = e.target.id;

      if(formID === 'single-form') {
        this.fileUpload(this.state.file).then(
          (res) => {
            console.log(res.data);
          }
        );
      }
      
  }

  onChange(e) {
    this.setState({
      file: e.target.files[0]
    });
  }

  onChangeStream(e) {
    // console.log(e.target.files[0]);
    this.setState({
      file: e.target.files[0]
    });
  }

  fileUpload(file) {
    const url = 'http://localhost:5000/upload/single';
    const formData = new FormData();
    formData.append('file', file);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    return post(url, formData, config);
  }


  render() {
    return (

      <div className="App">

        <section>
          <form onSubmit={this.onSubmit} id="single-form">
            <h1> File Upload - Single </h1>
            <input type="file" id="single-file" name="single-file" onChange={this.onChange} />
            <input type="submit" />
          </form>
        </section>

        
        <section>
          <h1> File Upload - Multiple</h1>
          <input type="file" id="multiple-file" name="multiple-file" multiple />
          <input type="submit" onClick={this.handleClick} />
        </section>

        <section>
          
          <form onSubmit={this.onSubmitStream} id="stream-single-form">
          <h1> File Upload - Single Streaming</h1>
            <input type="file" id="single-file-stream" name="single-file-stream" onChange={this.onChangeStream} />
            <input type="submit" />
          </form>
        </section>

        <section>
          <h1> File Upload - Multiple - Streaming</h1>
        </section>

      </div>
    );
  }
}



  
