'use client'
import { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut } from '@/firebase';
import InventoryPage from "./inventory/page";
import { Button, Typography, Box, AppBar, Toolbar } from '@mui/material';

export default function Home() {
  const [user, setUser] = useState(null);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setUser(user);

      // Check if the user is new and add them to the database if necessary
      const userDocRef = doc(firestore, `inventory/${user.uid}`);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Initialize user's inventory if they don't exist
        await setDoc(userDocRef, { items: {} });
      }
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

return (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <AppBar position="static">
      <Toolbar>
        {user && (
          <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Welcome, {user.displayName}
            </Typography>
            <Button variant="contained" color="secondary" onClick={handleSignOut}>
              Sign Out
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px' // Optional padding to avoid content touching the edges
      }}
    >
      {!user ? (
        <Button variant="contained" onClick={handleSignIn}>
          Sign In with Google
        </Button>
      ) : (
        <InventoryPage user={user} />
      )}
    </Box>
  </Box>
);
}
