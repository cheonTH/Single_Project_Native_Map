import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../api/AxiosApi';
import { useNavigation } from '@react-navigation/native';

const EditInfo = () => {
  const [step, setStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [form, setForm] = useState({
    name: '',
    userId: '',
    email: '',
    nickname: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [nicknameCheck, setNicknameCheck] = useState(null);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const navigation = useNavigation();

  const [token, setToken] = useState('');

  useEffect(() => {
    const loadTokenAndUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) setToken(storedToken);

        const res = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const userData = res.data;
        setForm((prev) => ({
          ...prev,
          name: userData.name,
          userId: userData.userId,
          email: userData.email,
          nickname: userData.nickName,
        }));
      } catch (err) {
        console.error('사용자 정보 불러오기 실패:', err);
      }
    };
    loadTokenAndUser();
  }, []);

  const handlePasswordCheck = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/users/check-password`,
        { password: currentPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setStep(2);
        setError('');
      } else {
        setError('비밀번호가 틀렸습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('비밀번호 확인 중 오류 발생');
    }
  };

  const handleCheckNickname = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/users/check-nickname?nickName=${form.nickname}`
      );
      setNicknameCheck(
        res.data.available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'
      );
    } catch (err) {
      console.error(err);
      setNicknameCheck('닉네임 중복 확인 실패');
    }
  };

  const handleUpdateProfile = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/users/update-profile`,
        {
          email: form.email,
          nickname: form.nickname,
          password: form.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await AsyncStorage.setItem('email', form.email);
      await AsyncStorage.setItem('nickName', form.nickname);

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigation.navigate('마이페이지');
      }, 1000);

      setError('');
    } catch (err) {
      console.error(err);
      setError('수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 개인정보 수정</Text>

      {step === 1 && (
        <View>
          <Text>현재 비밀번호 확인</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="현재 비밀번호 입력"
            secureTextEntry
            onSubmitEditing={handlePasswordCheck}
          />
          <TouchableOpacity style={styles.button} onPress={handlePasswordCheck}>
            <Text style={styles.buttonText}>확인</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      )}

      {step === 2 && (
        <View>
          <Text>이름</Text>
          <TextInput style={styles.input} value={form.name} editable={false} />

          <Text>아이디</Text>
          <TextInput style={styles.input} value={form.userId} editable={false} />

          <Text>이메일</Text>
          <TextInput style={styles.input} value={form.email} editable={false} />

          <Text>닉네임</Text>
          <View style={styles.nicknameRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={form.nickname}
              onChangeText={(text) => setForm({ ...form, nickname: text })}
            />
            <TouchableOpacity onPress={handleCheckNickname} style={styles.checkButton}>
              <Text style={styles.buttonText}>중복 확인</Text>
            </TouchableOpacity>
          </View>
          {nicknameCheck ? <Text>{nicknameCheck}</Text> : null}

          <Text>새 비밀번호</Text>
          <TextInput
            style={styles.input}
            value={form.newPassword}
            onChangeText={(text) => setForm({ ...form, newPassword: text })}
            secureTextEntry
          />

          <Text>비밀번호 확인</Text>
          <TextInput
            style={styles.input}
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>저장하기</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      )}

      {showSuccessMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>📚 개인정보 수정이 완료되었습니다!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#1F3F9D',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red' },
  nicknameRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  checkButton: {
    backgroundColor: '#1F3F9D',
    padding: 10,
    marginLeft: 5,
    borderRadius: 5,
  },
  toast: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  toastText: { color: '#fff' },
});

export default EditInfo;
