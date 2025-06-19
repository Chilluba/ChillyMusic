import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-text-primary">Welcome to ChillyMusic</h1>
      <nav>
        <ul className="space-y-2">
          <li><Link to="/search" className="text-accent-secondary hover:underline">Search Music</Link></li>
          <li><Link to="/downloads" className="text-accent-secondary hover:underline">My Downloads</Link></li>
          <li><Link to="/playlist/example123" className="text-accent-secondary hover:underline">Example Playlist</Link></li>
          <li><Link to="/settings" className="text-accent-secondary hover:underline">Settings</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
