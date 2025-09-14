import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../api/AxiosApi';

const FindPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // route.params에서 userId 받기
  const initialUserId = route.params?.userId || '';

  const [userId, setUserId] = useState(initialUserId);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetPassword = async () => {
    if (!userId || !email || !newPassword || !confirmPassword) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      setSuccessMessage('');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/reset-password`, {
        userId,
        email,
        newPassword,
      });

      setSuccessMessage(res.data);
      setErrorMessage('');
      setUserId('');
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSuccessMessage('');
      setErrorMessage(
        err.response?.data || '비밀번호 재설정 중 오류가 발생했습니다.'
      );
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('로그인');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="아이디 입력"
          value={userId}
          onChangeText={setUserId}
        />
        <TextInput
          style={styles.input}
          placeholder="가입한 이메일 입력"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호 입력"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호 확인"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>비밀번호 재설정</Text>
        </TouchableOpacity>
      </View>

      {successMessage ? (
        <Text style={styles.success}>✅ {successMessage}</Text>
      ) : null}

      {errorMessage ? (
        <Text style={styles.error}>❌ {errorMessage}</Text>
      ) : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
        <Text style={styles.loginButtonText}>로그인 페이지로 이동</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default FindPassword;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputBox: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1F3F9D',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  success: {
    backgroundColor: '#f0f9f0',
    padding: 10,
    borderRadius: 5,
    color: '#155724',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  error: {
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 5,
    color: '#721c24',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
