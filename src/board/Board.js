// components/BoardList.js
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BoardContext from "./BoardContext";
import BoardItem from "./BoardItem";

const BoardList = () => {
  const { boardList, loading, fetchBoards } = useContext(BoardContext);
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") setTitle("전체");
    else if (selectedCategory === "tip") setTitle("자취 팁");
    else if (selectedCategory === "자유") setTitle("자유");
    else if (selectedCategory === "질문") setTitle("자취 질문");
  }, [selectedCategory]);

  useEffect(() => {
    if (!boardList) return;

    const baseFiltered =
      selectedCategory === "all"
        ? [...boardList]
        : boardList.filter((item) => item.category === selectedCategory);

    let finalFiltered = baseFiltered;

    if (searchTerm.trim() !== "") {
      finalFiltered = baseFiltered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    finalFiltered.sort(
      (a, b) => new Date(b.writingTime) - new Date(a.writingTime)
    );

    setFilteredBoards(finalFiltered);
  }, [boardList, selectedCategory, searchTerm]);

  if (loading) return <ActivityIndicator size="large" color="#1F3F9D" />;
  if (!boardList || boardList.length === 0) {
    return (
      <View style={styles.container}>
        <Text>게시글이 없습니다.</Text>
      </View>
    );
  }

  if (filteredBoards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {isSearching ? `"${searchTerm}" 검색 결과` : `${title} 게시판`}
        </Text>
        <Text>해당 카테고리에 게시글이 없습니다.</Text>
      </View>
    );
  }

  const handleSearch = () => {
    setSearchTerm(searchQuery.trim());
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.linkItem}
      onPress={() => {
        navigation.navigate("게시글 상세", { id: item.id });
      }}
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSearching ? `"${searchTerm}" 검색 결과` : `${title} 게시판`}
      </Text>

      <FlatList
        data={filteredBoards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* 검색창 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="제목 또는 내용을 검색하세요"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={{ color: "white", fontSize: 16 }}>검색</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BoardList;

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
    // borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fefefe",
    // padding: 20,
    // margin: 20,
    // elevation: 3,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1F3F9D",
  },
  linkItem: {
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
    gap: 10,
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
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 6,
  },
});
