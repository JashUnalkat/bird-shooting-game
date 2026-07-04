// Import dependencies
import React from "react";
import { View } from "react-native";

const Bullet = (props) => {
  // Visibility check
  if (!props.active) {
    return null;
  }

  // Calculate dimensions and position
  const width = props.size[0];
  const height = props.size[1];
  const x = props.body.position.x - width / 2;
  const y = props.body.position.y - height / 2;

  // Determine angle based on bullet type
  let rotation = '0deg';
  if (props.body.label === "BulletTop") rotation = '-15deg'; 
  if (props.body.label === "BulletBot") rotation = '15deg';  

  return (
    // Bullet visual styling
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        backgroundColor: "#FFD700", 
        borderRadius: 2,
        transform: [{ rotate: rotation }],
        zIndex: 25,
        shadowColor: "#FFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
      }}
    />
  );
};

// Export component
export default Bullet;