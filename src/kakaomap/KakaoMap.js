import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

export default function KakaoMap() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Kakao Map</title>
        <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=34434a9d903010f808dd3530f7776b4d&libraries=services"></script>
        <style>
          html, body, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          window.onload = function() {
            try {
              var container = document.getElementById('map');
              var options = {
                center: new kakao.maps.LatLng(37.5665, 126.9780),
                level: 3
              };
              var map = new kakao.maps.Map(container, options);

              var marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(37.5665, 126.9780)
              });
              marker.setMap(map);

              var iwContent = '<div style="padding:5px;">여기가 서울입니다</div>';
              var infowindow = new kakao.maps.InfoWindow({ content: iwContent });
              infowindow.open(map, marker);
            } catch(e) {
              console.log("Kakao Map Error:", e);
            }
          }
        </script>
      </body>
    </html>
  `;

  // 화면 높이에 맞게 WebView 크기 설정
  const { width, height } = Dimensions.get("window");

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={{ width, height }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
