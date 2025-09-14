import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../api/AxiosApi';

const FindId = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [foundIds, setFoundIds] = useState([]);
  const [error, setError] = useState('');

  const navigation = useNavigation();

  const handleFindId = async () => {
    if (!name || !email) {
      Alert.alert('입력 오류', '이름과 이메일을 모두 입력해주세요.');
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/find-userId`, {
        params: { name, email },
      });

      const ids = res.data.userIds || [];
      if (ids.length === 0) {
        setError('해당 정보로 등록된 아이디가 없습니다.');
        setFoundIds([]);
      } else {
        setFoundIds(ids);
        setError('');
      }
    } catch (err) {
      setFoundIds([]);
      setError('아이디를 찾을 수 없습니다. 입력 정보를 다시 확인해주세요.');
    }
  };

  const handleGoToFindPw = (userId) => {
    navigation.navigate('비밀번호찾기', { userId });
  };

  const handleGoToLogin = () => {
    navigation.navigate('로그인');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>아이디 찾기</Text>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="이름 입력"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="가입한 이메일 입력"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleFindId}>
          <Text style={styles.buttonText}>아이디 찾기</Text>
        </TouchableOpacity>
      </View>

      {foundIds.length > 0 && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✅ 아래는 입력하신 정보로 등록된 아이디 목록입니다:</Text>
          {foundIds.map((id, idx) => (
            <View key={idx} style={styles.userRow}>
              <Text style={styles.userId}>{id}</Text>
              <TouchableOpacity 
                style={styles.pwButton} 
                onPress={() => handleGoToFindPw(id)}
              >
                <Text style={styles.pwButtonText}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
        <Text style={styles.loginButtonText}>로그인으로 이동</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default FindId;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
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
  successBox: {
    backgroundColor: '#f0f9f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  pwButton: {
    backgroundColor: '#1F3F9D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  pwButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  error: {
    color: 'red',
    marginBottom: 20,
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
