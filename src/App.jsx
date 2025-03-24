import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./components/pages/home/HomePage";
import ExplorerPage from "./components/pages/explorer/ExplorerPage";
import RegistryPage from "./components/pages/registry/RegistryPage";

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/registry" element={<RegistryPage />} />
          {/* You can add more routes here as needed */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
