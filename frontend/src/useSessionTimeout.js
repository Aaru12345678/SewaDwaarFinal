import { useEffect, useCallback, useRef } from 'react';

const SESSION_TIMEOUT = 20 * 60 * 1000; 
const CHECK_INTERVAL = 5000; 
const THROTTLE_TIME = 5000; 

const useSessionTimeout = (onTimeout) => {
  const lastUpdate = useRef(Date.now());

  const resetTimer = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdate.current > THROTTLE_TIME) {
      const expirationTime = now + SESSION_TIMEOUT;
      localStorage.setItem('sessionExpiration', expirationTime.toString());
      lastUpdate.current = now;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const initialExpiration = Date.now() + SESSION_TIMEOUT;
    localStorage.setItem('sessionExpiration', initialExpiration.toString());

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));

    const interval = setInterval(() => {
      const expirationTime = parseInt(localStorage.getItem('sessionExpiration') || '0');
      
      if (Date.now() > expirationTime) {
        onTimeout();
      }
    }, CHECK_INTERVAL);

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, [resetTimer, onTimeout]);
};

export default useSessionTimeout;