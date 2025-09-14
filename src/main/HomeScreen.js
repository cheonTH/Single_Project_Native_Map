import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import CurrentLocationMap from "../googlemap/CurrentLocationMap";
import PlaceDetailModal from "../googlemap/PlaceDetailModal";

export default function HomeScreen() {
  const mapRef = useRef(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSearch = (keyword) => {
    mapRef.current?.searchPlaces(keyword);
  };

  const handleMoveToMarker = (location) => {
    mapRef.current?.moveToMarker(location.lat, location.lng);
  };

  const openDetail = (place) => {
    setSelectedPlace(place);
    setIsModalVisible(true);
  };

  const closeDetail = () => {
    setSelectedPlace(null);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <CurrentLocationMap
        ref={mapRef}
        onSearchResult={(results) => setPlaces(results)}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.roundButton} onPress={() => handleSearch("혼밥")}>
          <Text style={styles.buttonText}>🍚 혼밥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundButton} onPress={() => handleSearch("코인세탁방")}>
          <Text style={styles.buttonText}>🧺 코인세탁방</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundButton} onPress={() => handleSearch("카페")}>
          <Text style={styles.buttonText}>☕ 카페</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.placeItem}>
            <TouchableOpacity onPress={() => handleMoveToMarker(item.location)}>
              <Text style={styles.placeName}>{item.name}</Text>
              <Text style={styles.placeAddr}>{item.address}</Text>
              <Text style={{ color: "#555" }}>거리: {item.distance} km</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.detailButton} onPress={() => openDetail(item)}>
              <Text style={styles.detailButtonText}>상세보기</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            검색 결과가 없습니다.
          </Text>
        }
      />

      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          visible={isModalVisible}
          onClose={closeDetail}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 40 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  roundButton: {
    backgroundColor: "#1F3F9D",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20, // 둥글게
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  list: { flex: 1, paddingHorizontal: 10 },
  placeItem: { padding: 10, backgroundColor: "white", borderRadius: 8, marginVertical: 5, elevation: 2 },
  placeName: { fontWeight: "bold", fontSize: 16 },
  placeAddr: { color: "#555", fontSize: 14 },
  detailButton: {
    marginTop: 5,
    backgroundColor: "#1F3F9D",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  detailButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
