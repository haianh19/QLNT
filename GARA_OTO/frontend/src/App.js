import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './layouts/Layout';

import Dashboard from './pages/Dashboard/Dashboard';
import Vehicles from './pages/Vehicles/Vehicles';
import Repairs from './pages/Repairs/Repairs';
import Materials from './pages/Materials/Materials';
import Payments from './pages/Payments/Payments';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import { MusicProvider } from './context/MusicContext';

import './styles/globals.css';
import './App.css';

function App() {
    return (
        <MusicProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/vehicles" element={<Vehicles />} />
                        <Route path="/repairs" element={<Repairs />} />
                        <Route path="/materials" element={<Materials />} />
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </MusicProvider>
    );
}

export default App;