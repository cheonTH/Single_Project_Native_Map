import React, { useContext, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BoardProvider } from './src/board/BoardContext';
import HomeScreen from './src/main/HomeScreen';
import BoardList from './src/board/Board';
import BoardDetailScreen from './src/board/BoardDetail';
import Login from './src/login/Login';
import MyPage from './src/login/Mypage';
import { AuthProvider, useAuth } from './auth/AuthContext';
import BoardSearchScreen from './src/board/BoardSearchScreen';
import BoardWrite from './src/board/BoardWrite';
import BoardEdit from './src/board/BoardEdit';
import Signup from './src/login/Signup';
import EditInfo from './src/login/EditInfo';
import FindId from './src/login/FindId';
import FindPassword from './src/login/FindPasswoard';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 게시판 스택
function BoardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="게시판" component={BoardList} />
      <Stack.Screen name="게시글 상세" component={BoardDetailScreen} />
      <Stack.Screen name="글쓰기" component={BoardWrite} />
      <Stack.Screen name="검색" component={BoardSearchScreen} />
      <Stack.Screen name="게시글 수정" component={BoardEdit} />
    </Stack.Navigator>
  );
}

function LoginStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="로그인" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="회원가입" component={Signup} />
      <Stack.Screen name="아이디찾기" component={FindId} />
      <Stack.Screen name="비밀번호찾기" component={FindPassword} />
    </Stack.Navigator>
  );
}

function MyPageStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="마이페이지" component={MyPage} />
      <Stack.Screen name="개인정보수정" component={EditInfo} />
    </Stack.Navigator>
  );
}

// 하단 탭
function MainTabs() {
  const {isLoggedIn} = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 12,
          paddingTop: 5,
          borderTopWidth: 1,
          borderTopColor: '#ddd',
          backgroundColor: '#1F3F9D',
        },
        tabBarLabelStyle: { fontSize: 13 },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '홈') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === '게시판') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === '마이페이지') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === '로그인') {
            iconName = focused ? 'log-in' : 'log-in-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="게시판" component={BoardStack} />
      {isLoggedIn ? (
        <Tab.Screen name="마이페이지" component={MyPageStack} />
      ) : (
        <Tab.Screen name="로그인" component={LoginStack} />
      )}
    </Tab.Navigator>
  );
}

// 최상위 App
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <BoardProvider>
              <NavigationContainer>
                <AuthProvider>
                  <MainTabs />
                </AuthProvider>
              </NavigationContainer>
            </BoardProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
