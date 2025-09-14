import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // RN에서는 sessionStorage 대신 AsyncStorage 사용
import { API_BASE_URL } from "../api/AxiosApi";
import { useAuth } from "../../auth/AuthContext";
import { useNavigation } from "@react-navigation/native";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const {isLoggedIn, setIsLoggedIn} = useAuth();

  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!userId || !password) {
      Alert.alert("입력 오류", "아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        userId,
        password,
      });

      const { token, nickName, email, id, name } = response.data;

      // 로그인 성공 시 AsyncStorage 저장
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("nickName", nickName);
      await AsyncStorage.setItem("name", name);
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("userId", userId);
      await AsyncStorage.setItem("userPk", id.toString());


      Alert.alert("로그인 성공", `${nickName}님 환영합니다!`);

      setIsLoggedIn(true);
      navigation.navigate("홈"); // React Navigation으로 홈 화면 이동
    } catch (err) {
      Alert.alert("로그인 실패", "아이디 또는 비밀번호를 확인해주세요.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      <TextInput
        style={styles.input}
        placeholder="아이디"
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "로그인 중..." : "로그인"}</Text>
      </TouchableOpacity>

      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate("회원가입")}>
          <Text style={styles.link}>회원가입</Text>
        </TouchableOpacity>
        <Text style={styles.divider}>|</Text>
        <TouchableOpacity onPress={() => navigation.navigate("아이디찾기")}>
          <Text style={styles.link}>아이디 찾기</Text>
        </TouchableOpacity>
        <Text style={styles.divider}>|</Text>
        <TouchableOpacity onPress={() => navigation.navigate("비밀번호찾기")}>
          <Text style={styles.link}>비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#1F3F9D",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  links: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    color: "#1F3F9D",
    marginHorizontal: 5,
  },
  divider: {
    marginHorizontal: 5,
    color: "#999",
  },
});
