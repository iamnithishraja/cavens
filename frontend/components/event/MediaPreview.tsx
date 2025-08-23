// import React from "react";
// import { View, Image, StyleSheet, Dimensions } from "react-native";
// import { Video } from "expo-video";
// import { Colors } from "@/constants/Colors";

// type Props = {
//   photos: string[];
//   videos: string[];
// };

// const { width } = Dimensions.get("window");

// const MediaPreview: React.FC<Props> = ({ photos, videos }) => {
//   const hero = photos[0] || videos[0];
//   const isVideo = !photos[0] && videos[0];

//   return (
//     <View style={styles.wrap}>
//       {isVideo ? (
//         <Video
//           style={styles.hero}
//           source={{ uri: videos[0] }}
//           resizeMode="cover"
//           isMuted
//           isLooping
//           shouldPlay
//         />
//       ) : (
//         <Image source={{ uri: hero }} style={styles.hero} />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   wrap: { width: "100%", height: width * 0.56, backgroundColor: Colors.surfaceElevated },
//   hero: { width: "100%", height: "100%" },
// });

// export default MediaPreview;


