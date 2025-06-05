import React, { useReducer, useRef, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./App.css";
import Home from "./pages/Home";
import New from "./pages/New";
import Diary from "./pages/Diary";
import Edit from "./pages/Edit";

const mockData = [
  {
    id: "mock1",
    date: new Date().getTime() - 1,
    content: "오늘은 정말 좋은 하루였다. 새로운 프로젝트를 시작하게 되어 기분이 매우 좋다.",
    emotionId: 1,
  },
  {
    id: "mock2",
    date: new Date().getTime() - 2,
    content: "프로젝트 진행이 조금 힘들었지만 해결책을 찾았다. 내일은 더 나아질 것이다.",
    emotionId: 2,
  },
  {
    id: "mock3",
    date: new Date().getTime() - 3,
    content: "오늘은 그저 그런 하루였다. 특별한 일은 없었지만 평온하게 지낼 수 있어 다행이다.",
    emotionId: 3,
  },
];

function reducer(state, action) {
  let newState;
  switch (action.type) {
    case "INIT": {
      return action.data;
    }
    case "CREATE": {
      newState = [action.data, ...state];
      break;
    }
    case "UPDATE": {
      newState = state.map((it) =>
        String(it.id) === String(action.data.id) ? { ...action.data } : it
      );
      break;
    }
    case "DELETE": {
      newState = state.filter((it) => String(it.id) !== String(action.targetId));
      break;
    }
    default: {
      return state;
    }
  }
  
  // localStorage에 데이터 저장
  localStorage.setItem("diary", JSON.stringify(newState));
  return newState;
}

export const DiaryStateContext = React.createContext();
export const DiaryDispatchContext = React.createContext();

function App() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [data, dispatch] = useReducer(reducer, []);
  const idRef = useRef(0);
  const location = useLocation();

  useEffect(() => {
    // 스크롤 맨 위로
    window.scrollTo(0, 0);
    
    // localStorage에서 데이터 불러오기
    const storedData = localStorage.getItem("diary");
    
    if (storedData) {
      // 저장된 데이터가 있으면 불러오기
      const parsedData = JSON.parse(storedData);
      
      // 가장 큰 id 값을 찾아서 idRef 설정
      if (parsedData.length > 0) {
        const maxId = Math.max(...parsedData.map(item => 
          typeof item.id === 'string' && item.id.startsWith('mock') 
            ? 0 
            : parseInt(item.id) || 0
        ));
        idRef.current = maxId + 1;
      }
      
      dispatch({
        type: "INIT",
        data: parsedData,
      });
      setIsDataLoaded(true);
    } else {
      // 저장된 데이터가 없으면 목 데이터 사용
      setTimeout(() => {
        dispatch({
          type: "INIT",
          data: mockData,
        });
        // 목 데이터도 localStorage에 저장
        localStorage.setItem("diary", JSON.stringify(mockData));
        setIsDataLoaded(true);
      }, 500);
    }
  }, [location.pathname]);

  const onCreate = (date, content, emotionId) => {
    dispatch({
      type: "CREATE",
      data: {
        id: idRef.current,
        date: new Date(date).getTime(),
        content,
        emotionId,
      },
    });
    idRef.current += 1;
  };

  const onUpdate = (targetId, date, content, emotionId) => {
    dispatch({
      type: "UPDATE",
      data: {
        id: targetId,
        date: new Date(date).getTime(),
        content,
        emotionId,
      },
    });
  };

  const onDelete = (targetId) => {
    dispatch({
      type: "DELETE",
      targetId,
    });
  };

  if (!isDataLoaded) {
    return (
      <div className="loading-spinner">
        {/* 로딩 스피너는 CSS에서 처리됨 */}
      </div>
    );
  } else {
    return (
      <DiaryStateContext.Provider value={data}>
        <DiaryDispatchContext.Provider
          value={{
            onCreate,
            onUpdate,
            onDelete,
          }}
        >
          <div className="App">
            <TransitionGroup>
              <CSSTransition
                key={location.key}
                timeout={500}
                classNames="page-transition"
              >
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/new" element={<New />} />
                  <Route path="/diary/:id" element={<Diary />} />
                  <Route path="/edit/:id" element={<Edit />} />
                </Routes>
              </CSSTransition>
            </TransitionGroup>
          </div>
        </DiaryDispatchContext.Provider>
      </DiaryStateContext.Provider>
    );
  }
}
export default App;
