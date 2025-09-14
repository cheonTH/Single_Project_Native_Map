import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native"; 
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { API_BASE_URL } from "../api/AxiosApi";
import BoardContext from "./BoardContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BoardWrite = ({ setSelectedMenu }) => {
  const navigation = useNavigation();
  const { fetchBoards } = useContext(BoardContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrls, setImageUrls] = useState([]); // base64 이미지
  const [loading, setLoading] = useState(false);

  // 이미지 선택
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "이미지 업로드를 위해 갤러리 접근 권한이 필요합니다.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => `data:image/jpeg;base64,${asset.base64}`);
      setImageUrls((prev) => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!title || !content || !category) {
      Alert.alert("알림", "모든 필드를 입력해주세요.");
      return;
    }

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("로그인 필요", "로그인이 필요합니다.");
      return;
    }

    const data = {
      title,
      content,
      category,
      userId: (await AsyncStorage.getItem("userId")) || "guest",
      nickName: (await AsyncStorage.getItem("nickName")) || "익명",
      writingTime: new Date().toISOString(),
      imageUrls: imageUrls, // base64 전송
      likeCount: 0,
      isLiked: false,
      commentCount: 0,
      isSaved: false,
    };

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/board`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("token",token);

      Alert.alert("성공", "게시글이 등록되었습니다.");
      fetchBoards();
      navigation.navigate("게시판");
      setSelectedMenu && setSelectedMenu("/board");
    } catch (err) {
      console.error("게시글 등록 실패:", err);
      Alert.alert("실패", "게시글 등록 실패!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>게시글 작성</Text>

      {/* 카테고리 선택 */}
      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
        style={styles.picker}
      >
        <Picker.Item label="카테고리 선택" value="" />
        <Picker.Item label="자취 팁" value="tip" />
        <Picker.Item label="자유게시판" value="자유" />
        <Picker.Item label="자취 질문" value="질문" />
      </Picker>

      {/* 제목 입력 */}
      <TextInput
        style={styles.input}
        placeholder="제목을 입력하세요"
        value={title}
        onChangeText={setTitle}
      />

      {/* 내용 입력 */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="내용을 입력하세요"
        value={content}
        onChangeText={setContent}
        multiline
      />

      {/* 이미지 선택 버튼 */}
      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text style={styles.uploadBtnText}>이미지 선택</Text>
      </TouchableOpacity>

      {/* 이미지 미리보기 */}
      <View style={styles.previewContainer}>
        {imageUrls.map((url, idx) => (
          <View key={idx} style={styles.imageWrapper}>
            <Image source={{ uri: url }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemoveImage(idx)}
            >
              <Text style={{ color: "white" }}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* 작성 완료 버튼 */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && { backgroundColor: "#ccc" }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitBtnText}>{loading ? "등록 중..." : "작성 완료"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BoardWrite;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: { height: 120, textAlignVertical: "top" },
  uploadBtn: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 15,
  },
  uploadBtnText: { color: "white", fontWeight: "bold" },
  previewContainer: { flexDirection: "row", flexWrap: "wrap" },
  imageWrapper: { position: "relative", marginRight: 10, marginBottom: 10 },
  image: { width: 100, height: 100, borderRadius: 6 },
  removeBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  submitBtn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  submitBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
