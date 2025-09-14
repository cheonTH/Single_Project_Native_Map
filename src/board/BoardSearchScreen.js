import React, { useContext, useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  View as RNView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import BoardContext from "./BoardContext";
import BoardItem from "./BoardItem";

const BoardSearchScreen = () => {
  const navigation = useNavigation();
  const { boardList, loading } = useContext(BoardContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBoards, setFilteredBoards] = useState([]);

  // 검색 실행
  const handleSearch = () => {
    const filtered = boardList.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBoards(filtered);
  };

  // 초기 상태: 전체 게시글 보여주기
  useEffect(() => {
    setFilteredBoards(boardList);
  }, [boardList]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => navigation.navigate("게시글 상세", { id: item.id })}
    >
      <BoardItem
        category={item.category}
        title={item.title}
        author={item.nickName}
        createdDate={item.writingTime}
        likeCount={item.likeCount}
        commentCount={item.commentCount}
      />
    </TouchableOpacity>
  );

  if (loading)
    return (
      <RNView style={styles.container}>
        <Ionicons name="reload" size={24} color="#1F3F9D" />
      </RNView>
    );

  return (
    <View style={styles.container}>
      {/* 🔍 검색창 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="검색어를 입력하세요"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="search" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* 검색 결과 */}
      <FlatList
        data={filteredBoards}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <RNView style={{ padding: 20 }}>
            <Ionicons name="search" size={24} color="#999" />
          </RNView>
        }
        renderItem={renderItem}
      />
    </View>
  );
};

export default BoardSearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  searchBtn: {
    backgroundColor: "#1F3F9D",
    paddingHorizontal: 16,
    justifyContent: "center",
    marginLeft: 8,
    borderRadius: 6,
  },
  resultItem: {
    marginBottom: 10,
  },
});
