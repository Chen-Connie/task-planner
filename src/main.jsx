import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; 
import AppLayout from "./AppLayout";
import Today from "./pages/Today";
import Upcoming from "./pages/Upcoming";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/today" replace />} /> {/* Add this line here */}
          <Route path="today" element={<Today />} />
          <Route path="upcoming" element={<Upcoming />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);