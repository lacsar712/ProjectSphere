import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Components/Navbar';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
        <Navbar />
        <main className="flex-grow pt-16">
            <Outlet />
        </main>
    </div>
  );
};

export default PublicLayout;
