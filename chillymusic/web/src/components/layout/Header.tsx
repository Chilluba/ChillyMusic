import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
// import { useWebThemeContext } from '../../context/ThemeContext'; // Not needed for this component if only using Tailwind classes

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className='flex items-center justify-between h-[60px] px-md
                     bg-bg-primary text-text-primary
                     dark:bg-dark-bg-primary dark:text-dark-text-primary
                     border-b border-border-primary dark:border-dark-border-primary'>
      <Link to='/' aria-label='Home' className='flex-shrink-0'>
        <h1 className='text-h2 font-bold text-accent-primary dark:text-dark-accent-primary hover:opacity-80 transition-opacity'>
          ChillyMusic
        </h1>
      </Link>
      <div className='flex items-center gap-xs sm:gap-sm md:gap-md'>
        <Link
          to='/'
          aria-label='Search'
          className={`p-2 rounded-md ${location.pathname === '/' || location.pathname.startsWith('/search')
            ? 'text-accent-primary dark:text-dark-accent-primary bg-accent-primary/10 dark:bg-dark-accent-primary/10'
            : 'text-text-secondary dark:text-dark-text-secondary'}
            hover:text-accent-primary dark:hover:text-dark-accent-primary hover:bg-accent-primary/5 dark:hover:bg-dark-accent-primary/5 transition-colors`}
        >
          <Icon name='MagnifyingGlass' size={24} />
        </Link>
        <Link
          to='/library'
          aria-label='Library'
          className={`p-2 rounded-md ${location.pathname === '/library'
            ? 'text-accent-primary dark:text-dark-accent-primary bg-accent-primary/10 dark:bg-dark-accent-primary/10'
            : 'text-text-secondary dark:text-dark-text-secondary'}
            hover:text-accent-primary dark:hover:text-dark-accent-primary hover:bg-accent-primary/5 dark:hover:bg-dark-accent-primary/5 transition-colors`}
        >
          <Icon name='Bookmark' size={24} />
        </Link>
        <Link
          to='/settings'
          aria-label='Settings'
          className={`p-2 rounded-md ${location.pathname === '/settings'
            ? 'text-accent-primary dark:text-dark-accent-primary bg-accent-primary/10 dark:bg-dark-accent-primary/10'
            : 'text-text-secondary dark:text-dark-text-secondary'}
            hover:text-accent-primary dark:hover:text-dark-accent-primary hover:bg-accent-primary/5 dark:hover:bg-dark-accent-primary/5 transition-colors`}
        >
          <Icon name='Gear' size={24} />
        </Link>
      </div>
    </header>
  );
};
export default Header;
