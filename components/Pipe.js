// Import dependencies
import React from "react";
import { View, Image } from "react-native";

const Pipe = (props) => {
  // Extract dimensions
  const width = Math.floor(props.size[0]);
  const height = Math.floor(props.size[1]);

  // Calculate position from physics body center
  const x = Math.floor(props.body.position.x - width / 2);
  const y = Math.floor(props.body.position.y - height / 2);

  // Determine pipe orientation from label
  const isTop = props.body.label.includes("Top");
  
  // Select appropriate asset
  const pipeSource = isTop 
    ? require("../assets/PipeTop1.png") 
    : require("../assets/PipeBottom1.png");

  return (
    // Pipe container styling
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: 5,
      }}
    >
      {/* Render pipe image */}
      <Image
        source={pipeSource}
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
export default Pipe;