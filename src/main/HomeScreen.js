import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Button, FlatList } from "react-native";
import CurrentLocationMap from "../kakaomap/CurrentLocationMap";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HomeScreen() {
  const mapRef = useRef(null); // CurrentLocationMap 참조
  const [places, setPlaces] = useState([]); // 검색 결과 저장

  const handleSearch = (keyword) => {
    if (mapRef.current) {
      mapRef.current.searchPlaces(keyword, (results) => {
        setPlaces(results);
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* 지도 */}
      <View style={styles.mapContainer}>
        <CurrentLocationMap ref={mapRef} />
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <Button title="🍚 혼밥" onPress={() => handleSearch("혼밥")} />
        <Button title="🧺 코인세탁방" onPress={() => handleSearch("코인세탁방")} />
        <Button title="☕ 카페" onPress={() => handleSearch("카페")} />
      </View>

      {/* 결과 리스트 */}
      <View style={styles.content}>
        <FlatList
          data={places}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.placeItem}>
              <Text style={styles.placeName}>{item.name}</Text>
              <Text style={styles.placeAddr}>{item.address}</Text>
            </View>
          )}
          ListEmptyComponent={<Text>검색 결과가 없습니다.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 25 },
  mapContainer: { height: SCREEN_HEIGHT / 3 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  placeItem: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
    marginVertical: 5,
    elevation: 2,
  },
  placeName: { fontWeight: "bold", fontSize: 16 },
  placeAddr: { color: "#555", fontSize: 14 },
});
