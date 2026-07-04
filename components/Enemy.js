// Import dependencies
import React from "react";
import { View, Image } from "react-native";

const Enemy = (props) => {
  // Calculate dimensions
  const width = Math.floor(props.size[0]);
  const height = Math.floor(props.size[1]);

  // Calculate position from physics body
  const x = Math.floor(props.body.position.x - width / 2);
  const y = Math.floor(props.body.position.y - height / 2);

  // Set animation frame based on entity status
  let frame = 0;
  if (props.status === "alert") frame = 1;
  if (props.status === "hurt") frame = 2;

  return (
    // Enemy container
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {/* Render specific frame from spritesheet */}
      <Image
        source={require("../assets/Enemy.png")}
        style={{
          width: width * 3, 
          height: height,
          transform: [
            { translateX: -frame * width }, 
          ],
        }}
        resizeMode="stretch"
      />
    </View>
  );
};

// Export component
export default Enemy;