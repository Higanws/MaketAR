import {
  FormInput,
  PanelLeft,
  RectangleHorizontal,
  Circle,
  Square,
  Table2,
  Type,
} from "lucide-react";

export const categories = [
  {
    name: "Basicas",
    items: [
      { label: "Rectangle", icon: Square, kind: "rect" },
      { label: "Circle", icon: Circle, kind: "circle" },
      { label: "Text", icon: Type, kind: "text" },
    ],
  },
  {
    name: "UI",
    items: [
      { label: "Button", icon: RectangleHorizontal, kind: "button" },
      { label: "Textbox", icon: FormInput, kind: "input" },
      { label: "Navbar", icon: PanelLeft, kind: "navbar" },
      { label: "Table", icon: Table2, kind: "table" },
    ],
  },
];
