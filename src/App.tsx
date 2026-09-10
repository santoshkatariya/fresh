import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing';
import { FarmerAuthPage } from './pages/FarmerAuth';
import { BuyerAuthPage } from './pages/BuyerAuth';
import { FarmerAppPage } from './pages/FarmerApp';
import { BuyerAppPage } from './pages/BuyerApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Farmer Authentication */}
        <Route path="/login/farmer" element={<FarmerAuthPage />} />
        <Route path="/signup/farmer" element={<FarmerAuthPage />} />

        {/* Buyer Authentication */}
        <Route path="/login/buyer" element={<BuyerAuthPage />} />
        <Route path="/signup/buyer" element={<BuyerAuthPage />} />

        {/* Farmer Portal & Tabs */}
        <Route path="/farmer" element={<Navigate to="/farmer/dashboard" replace />} />
        <Route path="/farmer/*" element={<FarmerAppPage />} />

        {/* Buyer Portal & Tabs */}
        <Route path="/buyer" element={<Navigate to="/buyer/dashboard" replace />} />
        <Route path="/buyer/*" element={<BuyerAppPage />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

