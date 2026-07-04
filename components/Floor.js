// Import dependencies
import React from "react";
import { View, Image } from "react-native";

const Floor = (props) => {
  // Extract dimensions
  const width = Math.floor(props.size[0]);
  const height = Math.floor(props.size[1]);

  // Calculate position from physics body center
  const x = Math.floor(props.body.position.x - width / 2);
  const y = Math.floor(props.body.position.y - height / 2);

  return (
    // Floor container styling
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Render floor texture */}
      <Image
        source={require("../assets/Floor.png")}
        style={{
          width: width,
          height: height,
        }}
        resizeMode="stretch" 
      />
    </View>
  );
};

// Export component
export default Floor;