import './App.css';
import { useState } from 'react';

function App() {
  const [visible, setVisible] = useState(false);

  function toggle() {
    setVisible(!visible);
  }

  return (
    <div className="web-extend-content-container">
      {visible && (
        <div className="web-extend-content">
          <h1>WebExtend + React</h1>
          <p>This is a content script.</p>
        </div>
      )}
      <div onClick={toggle}>
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          style={{ cursor: 'pointer' }}
        >
          <title>web-extend</title>
          <circle cx="512" cy="512" r="512" fill="#1296db" />
          <path
            d="M568.747 398.507l56.747 56.747h277.76L960 398.507v-277.76L903.253 64h-277.76l-56.747 56.747v277.76h0.001z m334.506-277.76v277.76h-277.76v-277.76h277.76zM64 903.253L120.747 960H736l56.747-56.747V622.507L736 568.747H455.253V288l-53.76-56.747H120.747L64 288V903.253z m56.747-334.506V288h280.747v280.747H120.747z m280.746 334.506H120.747V622.507h280.747v280.746h-0.001z m53.76-280.746H736v280.747H455.253V622.507z"
            fill="#fff"
            transform="scale(0.5 0.5) translate(512 512)"
          />
        </svg>
      </div>
    </div>
  );
}

export default App;
