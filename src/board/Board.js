import React, { useContext, useMemo, useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import BoardContext from "./BoardContext";
import BoardItem from "./BoardItem";

const BoardList = () => {
  const { boardList, loading, fetchBoards } = useContext(BoardContext);
  const navigation = useNavigation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 화면 들어올 때마다 새로 불러오기
  useFocusEffect(
    React.useCallback(() => {
      fetchBoards();
    }, [])
  );

  // 필터링
  const filteredBoards = useMemo(() => {
    if (!boardList) return [];

    // 카테고리 필터링
    const baseFiltered =
      selectedCategory === "all"
        ? [...boardList]
        : boardList.filter((item) => item.category === selectedCategory);

    // 검색어 필터링
    let finalFiltered = baseFiltered;
    if (searchTerm.trim() !== "") {
      finalFiltered = baseFiltered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 최신순 정렬
    finalFiltered.sort(
      (a, b) => new Date(b.writingTime) - new Date(a.writingTime)
    );

    return finalFiltered;
  }, [boardList, selectedCategory, searchTerm]);

  // 헤더 버튼
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 20, marginRight: 15 }}>
          <TouchableOpacity onPress={() => navigation.navigate("검색")}>
            <Ionicons name="search" size={24} color="#1F3F9D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("글쓰기")}>
            <Ionicons name="create-outline" size={24} color="#1F3F9D" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  if (loading) return <Text>로딩 중...</Text>;

  if (!boardList || boardList.length === 0) {
    return (
      <View style={styles.container}>
        <Text>게시글이 없습니다.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.linkItem}
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

  return (
    <View style={styles.container}>
      {/* 카테고리 선택 */}
      <Picker
        selectedValue={selectedCategory}
        style={styles.picker}
        onValueChange={(value) => setSelectedCategory(value)}
      >
        <Picker.Item label="전체" value="all" />
        <Picker.Item label="자취 팁" value="tip" />
        <Picker.Item label="자유" value="자유" />
        <Picker.Item label="자취 질문" value="질문" />
      </Picker>

      <FlatList
        data={filteredBoards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default BoardList;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fefefe",
    padding: 20,
    margin: 20,
    elevation: 3,
    flex: 1,
  },
  linkItem: {
    marginBottom: 10,
  },
  picker: {
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
  },
});
 