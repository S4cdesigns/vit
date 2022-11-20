import { resolve } from "path";

const path = resolve(__dirname, "files");

export default [
  {
    path,
    exclude: [],
    extensions: [".jpg"],
    expected: {
      num: 10,
    },
  },
  {
    path,
    exclude: [],
    extensions: [".mp4"],
    expected: {
      num: 1,
    },
  },
  {
    path,
    exclude: [],
    extensions: [".jpg", ".mp4"],
    expected: {
      num: 11,
    },
  },
  {
    path,
    exclude: ["some_"],
    extensions: [".jpg"],
    expected: {
      num: 5,
    },
  },
];
