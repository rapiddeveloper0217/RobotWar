import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Maze from "./pages/Maze";
import Mario from "./pages/Mario";
import Snake from "./pages/Snake/Snake";
import Payment from "./pages/Snake/Payment";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="maze" element={<Maze />} />
        <Route path="Mario" element={<Mario />} />
        <Route path="Snake">
          <Route index element={<Payment />} />
          <Route path="game" element={<Snake />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
