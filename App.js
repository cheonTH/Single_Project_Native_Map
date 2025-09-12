import React, { useState } from 'react';
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


// 글쓰기
function BoardWriteScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>✍️ 글쓰기 화면</Text>
    </View>
  );
}

// ✨ 임시 로그인 / 마이페이지
function LoginScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>🔑 로그인 화면</Text>
    </View>
  );
}

function MyPageScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>👤 마이페이지 화면</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 📌 게시판 스택
function BoardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="게시판메인" component={BoardList} options={{ headerShown: false }} />
      <Stack.Screen name="게시글 상세" component={BoardDetailScreen} />
      <Stack.Screen name="글쓰기" component={BoardWriteScreen} />
    </Stack.Navigator>
  );
}

// 📌 하단 탭
function MainTabs() {
  const [isLoggedIn, setIsLoggedIn] = useState(false) 

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
          backgroundColor: 'white',
        },
        tabBarLabelStyle: { fontSize: 13 },
        tabBarActiveTintColor: '#3498db',
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
        <Tab.Screen name="마이페이지" component={MyPageScreen} />
      ) : (
        <Tab.Screen name="로그인" component={LoginScreen} />
      )}
    </Tab.Navigator>
  );
}

// ✅ 최상위 App
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <BoardProvider>
              <NavigationContainer>
                <MainTabs />
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
