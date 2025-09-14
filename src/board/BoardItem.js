// components/BoardItem.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

const BoardItem = ({ category, title, author, createdDate, likeCount, commentCount }) => {
  const formattedDate = new Date(createdDate).toISOString().split("T")[0];

  return (
    <View style={styles.card}>
      {/* 제목 */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* 카테고리 + 작성자 */}
      <View style={styles.metaRow}>
        <Text style={styles.category}>[{category}]</Text>
        <Text style={styles.author}>{author}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {/* 좋아요 + 댓글 */}
      <View style={styles.bottomRow}>
        <View style={styles.iconRow}>
          <FontAwesome name="heart" size={16} color="#1F3F9D" />
          <Text style={styles.count}>{likeCount}</Text>
        </View>
        <View style={styles.iconRow}>
          <MaterialCommunityIcons name="comment-outline" size={16} color="#666" />
          <Text style={styles.count}>{commentCount}</Text>
        </View>
      </View>
    </View>
  );
};

export default BoardItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: "#1F3F9D",
    marginRight: 6,
  },
  author: {
    fontSize: 12,
    color: "#444",
    marginRight: 6,
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  count: {
    fontSize: 12,
    color: "#444",
  },
});
