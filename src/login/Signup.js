import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "../api/AxiosApi";

const Signup = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    name: "",
    userId: "",
    password: "",
    confirmPassword: "",
    nickName: "",
    email: "",
    emailCode: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const [serverCode, setServerCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const nameRegex = /^[가-힣a-zA-Z\s]+$/;
  const idRegex = /^[a-zA-Z0-9]{4,20}$/;
  const pwRegex = /^(?=(?:.*[A-Za-z]|.*\d))(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));

    let newErrors = {};
    let newSuccess = {};

    if (name === "name") {
      if (!nameRegex.test(value)) newErrors.name = "이름은 한글 또는 영문만 입력 가능합니다.";
      else newSuccess.name = "✅ 올바른 이름 형식입니다.";
    }

    if (name === "userId") {
      if (!idRegex.test(value)) newErrors.userId = "아이디는 영문자와 숫자 4~20자여야 합니다.";
      else newSuccess.userId = "✅ 형식이 올바른 아이디입니다.";
    }

    if (name === "password") {
      if (!pwRegex.test(value)) newErrors.password = "비밀번호는 조건을 만족해야 합니다.";
      else newSuccess.password = "✅ 안전한 비밀번호입니다.";

      if (form.confirmPassword) {
        if (value !== form.confirmPassword) {
          newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
          newSuccess.confirmPassword = "";
        } else {
          newErrors.confirmPassword = "";
          newSuccess.confirmPassword = "✅ 비밀번호가 일치합니다.";
        }
      }
    }

    if (name === "confirmPassword") {
      if (value !== form.password) {
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        newSuccess.confirmPassword = "";
      } else {
        newErrors.confirmPassword = "";
        newSuccess.confirmPassword = "✅ 비밀번호가 일치합니다.";
      }
    }

    if (name === "nickName") {
      if (value.length < 2) newErrors.nickName = "닉네임은 2자 이상이어야 합니다.";
      else newSuccess.nickName = "✅ 형식이 올바른 닉네임입니다.";
    }

    if (name === "email") {
      if (!emailRegex.test(value)) newErrors.email = "유효한 이메일 형식이 아닙니다.";
      else newSuccess.email = "✅ 이메일 형식이 올바릅니다.";
    }

    setErrors(prev => ({ ...prev, [name]: newErrors[name] || "" }));
    setSuccess(prev => ({ ...prev, [name]: newSuccess[name] || "" }));
  };

  const checkUserIdDuplicate = async () => {
    if (!idRegex.test(form.userId)) {
      setErrors(prev => ({ ...prev, userId: "아이디는 영문자와 숫자 4~20자여야 합니다." }));
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/check-userId`, {
        params: { userId: form.userId },
      });
      if (res.data.available) {
        setSuccess(prev => ({ ...prev, userId: "✅ 사용 가능한 아이디입니다." }));
        setErrors(prev => ({ ...prev, userId: "" }));
      } else {
        setErrors(prev => ({ ...prev, userId: "❌ 이미 사용 중인 아이디입니다." }));
        setSuccess(prev => ({ ...prev, userId: "" }));
      }
    } catch {
      setErrors(prev => ({ ...prev, userId: "서버 오류로 아이디 확인 실패" }));
    }
  };

  const checkNicknameDuplicate = async () => {
    if (form.nickName.length < 2) {
      setErrors(prev => ({ ...prev, nickName: "닉네임은 2자 이상이어야 합니다." }));
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/check-nickname`, {
        params: { nickName: form.nickName },
      });
      if (res.data.available) {
        setSuccess(prev => ({ ...prev, nickName: "✅ 사용 가능한 닉네임입니다." }));
        setErrors(prev => ({ ...prev, nickName: "" }));
      } else {
        setErrors(prev => ({ ...prev, nickName: "❌ 이미 사용 중인 닉네임입니다." }));
        setSuccess(prev => ({ ...prev, nickName: "" }));
      }
    } catch {
      setErrors(prev => ({ ...prev, nickName: "서버 오류로 닉네임 확인 실패" }));
    }
  };

  const handleSendEmailCode = async () => {
    if (!emailRegex.test(form.email)) {
      setErrors(prev => ({ ...prev, email: "올바른 이메일을 입력해주세요." }));
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/send-verification-code`, null, {
        params: { email: form.email },
      });
      setServerCode(res.data.code);
      setEmailSent(true);
      Alert.alert("✅ 인증번호 전송 성공");
    } catch (err) {
      Alert.alert("이메일 전송 실패", err.response?.data || err.message);
    }
  };

  const handleVerifyEmailCode = () => {
    if (form.emailCode === serverCode) {
      setEmailVerified(true);
      Alert.alert("✅ 이메일 인증 완료");
    } else {
      Alert.alert("인증번호가 일치하지 않습니다.");
    }
  };

  const handleSignup = async () => {
    const newErrors = {};
    if (!nameRegex.test(form.name)) newErrors.name = "이름은 한글 또는 영문만 입력 가능합니다.";
    if (!idRegex.test(form.userId)) newErrors.userId = "아이디는 영문자와 숫자 4~20자여야 합니다.";
    if (!pwRegex.test(form.password)) newErrors.password = "비밀번호는 조건을 만족해야 합니다.";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    if (!emailRegex.test(form.email)) newErrors.email = "유효한 이메일 형식이 아닙니다.";
    if (!emailVerified) newErrors.emailCode = "이메일 인증을 완료해주세요.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const { confirmPassword, emailCode, ...signupData } = form;
      await axios.post(`${API_BASE_URL}/api/users/signup`, signupData);
      Alert.alert("✅ 회원가입 성공!");
      navigation.navigate("로그인");
    } catch (err) {
      Alert.alert("회원가입 실패", err.response?.data || err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TextInput
          style={styles.input}
          placeholder="이름"
          value={form.name}
          onChangeText={text => handleChange("name", text)}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        {success.name && <Text style={styles.success}>{success.name}</Text>}

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="아이디"
            value={form.userId}
            onChangeText={text => handleChange("userId", text)}
          />
          <TouchableOpacity style={styles.checkButton} onPress={checkUserIdDuplicate}>
            <Text style={styles.checkButtonText}>중복</Text>
          </TouchableOpacity>
        </View>
        {errors.userId && <Text style={styles.error}>{errors.userId}</Text>}
        {success.userId && <Text style={styles.success}>{success.userId}</Text>}

        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          secureTextEntry
          value={form.password}
          onChangeText={text => handleChange("password", text)}
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        {success.password && <Text style={styles.success}>{success.password}</Text>}

        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={text => handleChange("confirmPassword", text)}
        />
        {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
        {success.confirmPassword && <Text style={styles.success}>{success.confirmPassword}</Text>}

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="닉네임"
            value={form.nickName}
            onChangeText={text => handleChange("nickName", text)}
          />
          <TouchableOpacity style={styles.checkButton} onPress={checkNicknameDuplicate}>
            <Text style={styles.checkButtonText}>중복</Text>
          </TouchableOpacity>
        </View>
        {errors.nickName && <Text style={styles.error}>{errors.nickName}</Text>}
        {success.nickName && <Text style={styles.success}>{success.nickName}</Text>}

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="이메일"
            keyboardType="email-address"
            value={form.email}
            onChangeText={text => handleChange("email", text)}
          />
          <TouchableOpacity style={styles.checkButton} onPress={handleSendEmailCode}>
            <Text style={styles.checkButtonText}>인증번호 요청</Text>
          </TouchableOpacity>
        </View>
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        {success.email && <Text style={styles.success}>{success.email}</Text>}

        {emailSent && (
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="인증번호 입력"
              value={form.emailCode}
              onChangeText={text => handleChange("emailCode", text)}
            />
            <TouchableOpacity style={styles.checkButton} onPress={handleVerifyEmailCode}>
              <Text style={styles.checkButtonText}>인증 확인</Text>
            </TouchableOpacity>
          </View>
        )}
        {errors.emailCode && <Text style={styles.error}>{errors.emailCode}</Text>}
        {emailVerified && <Text style={styles.success}>✅ 이메일 인증 완료</Text>}

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>회원가입</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("로그인")}>
          <Text style={styles.backButtonText}>로그인 페이지로 이동</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { 
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 10,
  },
  row: { 
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkButton: { 
    backgroundColor: "#1F3F9D",
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 6,
    marginLeft: 5,
    marginBottom: 10,
  },
  checkButtonText: { 
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  error: { color: "red", marginBottom: 5 },
  success: { color: "green", marginBottom: 5 },
  signupButton: { 
    backgroundColor: "#1F3F9D", 
    padding: 12, 
    borderRadius: 6, 
    alignItems: "center", 
    marginTop: 10 
  },
  signupButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  backButton: { marginTop: 10, alignItems: "center" },
  backButtonText: { color: "#1F3F9D" },
});
