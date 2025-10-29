import { Text, View, StyleSheet } from "react-native";
import RoomBooking from "./components/RoomBooking";

export default function Index() {
  return (
    <View style={styles.container}>
      <RoomBooking />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
});
