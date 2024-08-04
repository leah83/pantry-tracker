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
    <Box>
      <AppBar position="static">
        <Toolbar>
          {user && (
            <Box sx={{ display: 'flex', flex: 1, alignItems: 'center' }}>
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
          justifyContent: 'center',
          alignItems: 'center',
          //height: 'calc(100vh - 64px)', // Adjust height to account for AppBar
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
