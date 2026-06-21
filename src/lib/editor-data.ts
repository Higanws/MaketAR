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

export const projectSeed = [
  {
    id: "project-visual-docs",
    name: "Visual Docs Hub",
    updatedAt: "Hoy",
    diagrams: 4,
  },
  {
    id: "project-cloud",
    name: "Cloud Architecture",
    updatedAt: "Ayer",
    diagrams: 7,
  },
  {
    id: "project-mobile",
    name: "Mobile Checkout",
    updatedAt: "Jun 12",
    diagrams: 3,
  },
];

export const diagramSeed = [
  { id: "wireframe-home", name: "Wireframe Home", type: "WIREFRAME" },
  { id: "checkout-flow", name: "Checkout Flow", type: "FLOWCHART" },
  { id: "mixed-architecture", name: "Mixed Architecture", type: "MIXED" },
];
