import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { View } from 'react-native';

export default function GradientText({ text, fontSize = 16, width = 200 }) {
  return (
    <View style={{ height: fontSize * 1.3, justifyContent: 'center' }}>
      <Svg height={fontSize * 1.3} width={width}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#f9ce34" />
            <Stop offset="0.5" stopColor="#ee2a7b" />
            <Stop offset="1" stopColor="#6228d7" />
          </LinearGradient>
        </Defs>
        <SvgText
          fill="url(#grad)"
          fontSize={fontSize}
          fontWeight="bold"
          x="50%"                       // horizontally center
          y="50%"                       // vertically center baseline
          textAnchor="middle"           // center anchor
          alignmentBaseline="middle"    // center vertically (this is the key)
        >
          {text}
        </SvgText>
      </Svg>
    </View>
  );
}
