import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Modal, Linking,
  StyleSheet, Alert, Platform, KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../api/AxiosApi";

const PlaceDetailModal = ({ place, visible, onClose, isAdmin }) => {
  const [reviewInput, setReviewInput] = useState("");
  const [reviewList, setReviewList] = useState([]);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [nickName, setNickName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [myReview, setMyReview] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const textInputRef = useRef(null);
  const reviewsPerPage = 5;

  useEffect(() => {
    const loadUserData = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedNickName = await AsyncStorage.getItem("nickName");
      if (storedToken) setToken(storedToken);
      if (storedUserId) setUserId(storedUserId);
      if (storedNickName) setNickName(storedNickName);
    };
    loadUserData();
  }, []);

  console.log(place)

  useEffect(() => {
    if (!place) return;
    axios.get(`${API_BASE_URL}/api/reviews/${place.address}`)
      .then(res => {
        setReviewList(res.data);
        setCurrentPage(1);
        if (userId) setMyReview(res.data.find(r => r.userId === userId) || null);
      })
      .catch(err => console.error("리뷰 불러오기 실패", err));
  }, [place, userId]);

  useEffect(() => {
    if (visible && userId && !myReview) textInputRef.current?.focus();
  }, [visible, userId, myReview]);

  const handleSubmit = async () => {
    if (!reviewInput.trim()) return;
    if (!userId || !token) return Alert.alert("알림", "로그인 후 작성 가능");
    if (myReview) return Alert.alert("알림", "이미 리뷰 작성됨");

    try {
      await axios.post(`${API_BASE_URL}/api/reviews`, {
        placeId: place.address,
        placeName: place.name,
        review: reviewInput,
        userId, nickName,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setReviewInput("");
      const updated = await axios.get(`${API_BASE_URL}/api/reviews/${place.address}`);
      setReviewList(updated.data);
      setCurrentPage(1);
      setMyReview(updated.data.find(r => r.userId === userId) || null);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (reviewId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
      const updated = await axios.get(`${API_BASE_URL}/api/reviews/${place.id}`);
      setReviewList(updated.data);
      if (reviewId === myReview?.id) setMyReview(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 1000);
    } catch (err) { console.error(err); }
  };

  const totalPages = Math.ceil(reviewList.length / reviewsPerPage);
  const currentReviews = reviewList.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);

  if (!place) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{place.name}</Text>
          <Text>📍 주소: {place.formatted_address || place.address || "주소 없음"}</Text>
          <Text>📞 전화번호: {place.formatted_phone_number || "없음"}</Text>
          <Text>📂 카테고리: {place.types?.[0] || "정보 없음"}</Text>

          <TouchableOpacity onPress={() => Linking.openURL(googleMapsUrl)}>
            <Text style={{ color: "blue", marginVertical: 5 }}>👉 구글맵에서 보기</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.subtitle}>한줄 리뷰</Text>

            {myReview && (
              <View style={styles.myReview}>
                <Text><Text style={{ fontWeight: "bold" }}>내 리뷰</Text>: 📝 {myReview.review}</Text>
                <TouchableOpacity onPress={() => handleDelete(myReview.id)}>
                  <Text style={styles.delete}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}

            {userId && !myReview ? (
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <TextInput
                  ref={textInputRef}
                  style={styles.input}
                  placeholder="리뷰를 입력하세요"
                  value={reviewInput}
                  onChangeText={setReviewInput}
                />
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>작성</Text>
                </TouchableOpacity>
              </View>
            ) : !userId ? (
              <Text style={{ color: "gray" }}>리뷰 작성은 로그인 후 가능합니다.</Text>
            ) : null}

            <FlatList
              data={currentReviews}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <View style={styles.reviewItem}>
                  <Text><Text style={{ fontWeight: "bold" }}>{item.nickName}</Text>: 📝 {item.review}</Text>
                  {(item.userId === userId || isAdmin) && (
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Text style={styles.delete}>삭제</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              ListEmptyComponent={<Text>리뷰가 없습니다.</Text>}
            />

            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity onPress={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                  <Text>◀ 이전</Text>
                </TouchableOpacity>
                <Text>{currentPage} / {totalPages}</Text>
                <TouchableOpacity onPress={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  <Text>다음 ▶</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ color: "white" }}>닫기</Text>
          </TouchableOpacity>
        </View>

        {showSuccessMessage && (
          <View style={styles.toast}>
            <Text style={{ color: "white" }}>✅ 삭제 완료!</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modal: { width: "90%", backgroundColor: "white", borderRadius: 8, padding: 15, maxHeight: "80%" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  section: { marginTop: 10 },
  subtitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  myReview: { backgroundColor: "#f7f7f7", padding: 10, borderRadius: 6, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: 8, marginRight: 5 },
  button: { backgroundColor: "#007bff", borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12 },
  buttonText: { color: "white" },
  reviewItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  delete: { color: "red", marginLeft: 10 },
  pagination: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, alignItems: "center" },
  closeBtn: { marginTop: 15, backgroundColor: "#333", padding: 10, borderRadius: 6, alignItems: "center" },
  toast: { position: "absolute", bottom: 50, backgroundColor: "#333", padding: 10, borderRadius: 6 },
});

export default PlaceDetailModal;
