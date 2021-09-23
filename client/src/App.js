import React, {useDebugValue, useState} from 'react'
import {useHttp} from './hooks/http.hook'
import download from 'js-file-download'

function App() {

  const {loading, request, error, clearError} = useHttp()

  const [currentValue, setCurrentValue] = useState({
    url: '',
    fulldate: ''
  })

  const [getFileUrl, setGetFileUrl] = useState('')

  const sendData = async () => {
    const d = request('/api/create-new-stream', 'POST', currentValue)
  }

  const getFile = async () => {

    await fetch('/api/getFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({url: getFileUrl}),
    }).then( res => {
      download(res.data, 'stream.csv'); 
    })
  
  }

  return (
    <div className="App">
      <div>
        <input type='text' placeholder='введите url стрима' value={currentValue.url} onChange={ (e) => setCurrentValue({...currentValue, url: e.target.value}) />
        <input id="datetime" type="datetime-local" value={currentValue.fulldate} onChange={ (e) => setCurrentValue({...currentValue, fulldate: e.target.value}) }/>
        <button onClick={ () => sendData()}>Отправить</button>
      </div>
      
      <div>
        <input type='text' placeholder='введите url стрима' value={getFileUrl} onChange={ (e) => setGetFileUrl(e.target.value) }/>
        <button onClick={ () => getFile()}>Скачать</button>
      </div>
    </div>
  );
}

export default App;
