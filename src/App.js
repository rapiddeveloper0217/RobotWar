import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Maze from "./pages/Maze";
import Mario from "./pages/Mario";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="maze" element={<Maze />} />
        <Route path="Mario" element={<Mario />} />
      </Routes>
    </BrowserRouter>
  );
}
