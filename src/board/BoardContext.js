// context/BoardContext.js
import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../api/AxiosApi";

const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
  const [boardList, setBoardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 게시글 불러오기
  const fetchBoards = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/board`);
      setBoardList(res.data);
      setError(null);
    } catch (err) {
      console.error("게시글 불러오기 실패:", err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 좋아요 수 및 상태 업데이트
  const updateBoardLikeCount = (boardId, newLikeCount, liked) => {
    setBoardList((prev) =>
      prev.map((item) =>
        item.id === boardId ? { ...item, likeCount: newLikeCount, liked } : item
      )
    );
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return (
    <BoardContext.Provider
      value={{
        boardList,
        loading,
        error,
        fetchBoards,
        updateBoardLikeCount,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export default BoardContext;
