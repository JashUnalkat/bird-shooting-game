// Import dependencies
import React, { useEffect, useState } from "react";
import { View, Image } from "react-native";

const Bird = (props) => {
  // Animation frame state
  const [frame, setFrame] = useState(0);

  // Calculate dimensions
  const width = Math.floor(props.size[0]);
  const height = Math.floor(props.size[1]);

  // Calculate physics position
  const x = Math.floor(props.body.position.x - width / 2);
  const y = Math.floor(props.body.position.y - height / 2);

  // Sprite animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev >= 5 ? 0 : prev + 1)); 
    }, 80); 

    return () => clearInterval(interval);
  }, []);

  return (
    // Bird container
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        overflow: "hidden",
        zIndex: 999,
      }}
    >
      {/* Spritesheet image rendering */}
      <Image
        source={require("../assets/Bird.png")}
        style={{
          width: width * 3,   
          height: height * 2, 
          transform: [
            { translateX: -(frame % 3) * width },
            { translateY: -Math.floor(frame / 3) * height },
          ],
        }}
      />
    </View>
  );
};

// Export component
export default Bird;