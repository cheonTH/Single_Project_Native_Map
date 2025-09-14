import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../api/AxiosApi";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../auth/AuthContext";

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    userId: "",
    email: "",
    nickName: "",
  });
  const [loading, setLoading] = useState(true);

  const { setIsLoggedIn } = useAuth(); // 로그인 상태 전역 관리
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("오류", "로그인이 필요합니다.");
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserInfo({
          name: res.data.name,
          userId: res.data.userId,
          email: res.data.email,
          nickName: res.data.nickName,
        });

        // 동기화용 AsyncStorage 업데이트
        await AsyncStorage.setItem("name", res.data.name);
        await AsyncStorage.setItem("email", res.data.email);
        await AsyncStorage.setItem("nickName", res.data.nickName);
      } catch (err) {
        console.error("사용자 정보 가져오기 실패", err);
        Alert.alert("오류", "사용자 정보를 가져오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // 저장된 모든 사용자 데이터 삭제
      setIsLoggedIn(false); // 전역 상태 변경
      Alert.alert("로그아웃", "성공적으로 로그아웃되었습니다.");
      navigation.navigate("홈"); // 홈 화면으로 이동
    } catch (err) {
      console.error("로그아웃 실패", err);
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f08c00" />
        <Text>불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>마이페이지</Text>

      <View style={styles.infoBox}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitle}>내 정보</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("개인정보수정")}
          >
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          <Text style={styles.label}>이름: </Text>
          {userInfo.name}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>아이디: </Text>
          {userInfo.userId}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>이메일: </Text>
          {userInfo.email}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>닉네임: </Text>
          {userInfo.nickName}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MyPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#1F3F9D",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
