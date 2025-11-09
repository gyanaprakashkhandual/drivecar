'use client'
import React from 'react'
import { useEffect } from 'react';
function Page() {
    // In your /app page
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include', // Send cookies automatically
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  fetchUser();
}, []);
  return (
    <div>page</div>
  )
}

export default Page