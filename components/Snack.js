// Import dependencies
import React, { useEffect, useState } from "react";
import { View, Image } from "react-native";

const Snack = (props) => {
  // Animation frame state
  const [frame, setFrame] = useState(0);

  // Calculate dimensions
  const width = Math.floor(props.size[0]);
  const height = Math.floor(props.size[1]);

  // Calculate position from physics body
  const x = Math.floor(props.body.position.x - width / 2);
  const y = Math.floor(props.body.position.y - height / 2);

  // Animation loop for sprite cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev >= 5 ? 0 : prev + 1)); 
    }, 100); 

    return () => clearInterval(interval);
  }, []);

  return (
    // Snack container
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        overflow: "hidden",
        zIndex: 40,
      }}
    >
      {/* Spritesheet animation transform */}
      <Image
        source={require("../assets/Snack.png")}
        style={{
          width: width * 3,   
          height: height * 2, 
          transform: [
            { translateX: -(frame % 3) * width },
            { translateY: -Math.floor(frame / 3) * height },
          ],
        }}
        resizeMode="stretch"
      />
    </View>
  );
};

// Export component
export default Snack;