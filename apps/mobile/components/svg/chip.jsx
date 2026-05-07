import * as React from "react"
import Svg, { SvgProps, Rect, Path, G, Defs } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: marker */
const ChipSvg = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={30}
    fill="none"
    style={{
      WebkitPrintColorAdjust: ":exact",
    }}
    viewBox="2889 351 21 30"
    {...props}
  >
    <Rect
      width={21}
      height={30}
      x={2889}
      y={351}
      className="fills"
      rx={3}
      ry={3}
      style={{
        fill: "#e9e9e9",
        fillOpacity: 1,
      }}
    />
    <Path d="M2892.5 363h14" className="fills" />
    <G className="strokes">
      <Path
        d="M2892.5 363h14"
        className="stroke-shape"
        style={{
          fill: "none",
          fillOpacity: "none",
          strokeWidth: 2,
          stroke: "#bdbdbd",
          strokeOpacity: 1,
          strokeLinecap: "round",
        }}
      />
    </G>
    <Path d="M2896.5 363v-5" className="fills" />
    <G className="strokes">
      <G className="stroke-shape">
        <Defs></Defs>
        <Path
          d="M2896.5 363v-5"
          style={{
            fill: "none",
            fillOpacity: "none",
            strokeWidth: 2,
            stroke: "#bdbdbd",
            strokeOpacity: 1,
            markerEnd: "url(#a)",
          }}
        />
      </G>
    </G>
    <Path d="M2902.5 363v-5" className="fills" />
    <G className="strokes">
      <G className="stroke-shape">
        <Defs></Defs>
        <Path
          d="M2902.5 363v-5"
          style={{
            fill: "none",
            fillOpacity: "none",
            strokeWidth: 2,
            stroke: "#bdbdbd",
            strokeOpacity: 1,
            markerEnd: "url(#b)",
          }}
        />
      </G>
    </G>
    <Path d="M2906.5 369h-10v5" className="fills" />
    <G className="strokes">
      <Path
        d="M2906.5 369h-10v5"
        className="stroke-shape"
        style={{
          fill: "none",
          fillOpacity: "none",
          strokeWidth: 2,
          stroke: "#bdbdbd",
          strokeOpacity: 1,
          strokeLinecap: "round",
        }}
      />
    </G>
    <Path d="M2902.5 369v5" className="fills" />
    <G className="strokes">
      <Path
        d="M2902.5 369v5"
        className="stroke-shape"
        style={{
          fill: "none",
          fillOpacity: "none",
          strokeWidth: 2,
          stroke: "#bdbdbd",
          strokeOpacity: 1,
          strokeLinecap: "round",
        }}
      />
    </G>
  </Svg>
)
export default ChipSvg
