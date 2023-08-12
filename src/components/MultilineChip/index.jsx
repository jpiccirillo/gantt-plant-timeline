import React from "react";
import { Chip, Typography } from "@mui/material";
import "../../style/sidebar.css";

const MultilineChip = ({ value, getTagProps }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "5px",
        paddingTop: "5px",
        paddingBottom: "5px",
        width: "100%",
      }}
    >
      {value.map((option, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={
              <Typography style={{ whiteSpace: "normal" }}>{option}</Typography>
            }
            {...getTagProps({ index })}
            style={{ height: "100%" }}
          />
        </div>
      ))}
    </div>
  );
};

export default MultilineChip;
