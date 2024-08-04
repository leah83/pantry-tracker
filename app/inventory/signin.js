'use client';
import React, { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { collection, query, getDocs, setDoc, deleteDoc, doc, getDoc, updateDoc, where } from 'firebase/firestore';
import {
  AppBar,
  Box,
  MenuItem,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RecipeSuggestions from './recipeSuggestion';

const InventoryPage = ({ user }) => {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodGroup, setSelectedFoodGroup] = useState('All');
  const [editItemId, setEditItemId] = useState(null);

  const foodGroups = {
    All: [],
    Pantry: ['Canned Goods', 'Snacks', 'Staples'],
    FreshProduce: ['Fruits', 'Vegetables'],
    Dairy: ['Milk', 'Cheese', 'Yogurt'],
    Poultry: ['Chicken', 'Turkey', 'Eggs'],
    Meats: ['Beef', 'Pork', 'Lamb'],
    Seafood: ['Salmon', 'Tuna', 'Cod'],
  };

  const updateInventory = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'inventory', user.uid, 'items'));
      const inventoryList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        inventoryList.push({
          id: doc.id,
          ...data,
        });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    if (user) {
      updateInventory();
    }
  }, [user]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFoodGroupChange = (event, newValue) => {
    setSelectedFoodGroup(newValue);
  };

  const filteredItems = inventory.filter(item => {
    const matchesFoodGroup = selectedFoodGroup === 'All' || item.foodGroup === selectedFoodGroup;
    const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFoodGroup && matchesSearch;
  });

  const addItem = async () => {
    if (!itemName || !selectedFoodGroup) return;

    await setDoc(doc(firestore, 'inventory', user.uid, 'items', itemName), {
      name: itemName,
      foodGroup: selectedFoodGroup,
      quantity: itemQuantity,
    });

    setItemName('');
    setItemQuantity('');
    setOpen(false);
    await updateInventory();
  };

  const removeItem = async (itemName) => {
    await deleteDoc(doc(firestore, 'inventory', user.uid, 'items', itemName));
    await updateInventory();
  };

  const editItem = async () => {
    if (editItemId) {
      const docRef = doc(firestore, 'inventory', user.uid, 'items', editItemId);
      await updateDoc(docRef, {
        name: itemName,
        foodGroup: selectedFoodGroup,
        quantity: parseInt(itemQuantity, 10),
      });
      setItemName('');
      setItemQuantity('');
      setEditItemId(null);
      setOpen(false);
      await updateInventory();
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setItemName(item.id);
      setItemQuantity(item.quantity);
      setEditItemId(item.id);
      setSelectedFoodGroup(item.foodGroup);
    } else {
      setItemName('');
      setItemQuantity('');
      setEditItemId(null);
      setSelectedFoodGroup('All'); // Default to a food group
    }
    setOpen(true);
  };

  const handleClose = () => {
    setItemName('');
    setItemQuantity('');
    setEditItemId(null);
    setOpen(false);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Pantry Tracker</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Tabs value={selectedFoodGroup} onChange={handleFoodGroupChange} aria-label="food groups">
            {Object.keys(foodGroups).map(group => (
              <Tab key={group} value={group} label={group.replace(/([A-Z])/g, ' $1')} />
            ))}
          </Tabs>
          {/* <RecipeSuggestions pantryItems={filteredItems} /> */}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Search Items"
            variant="outlined"
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add New Item
          </Button>
        </Box>
        <Typography variant="h4" gutterBottom>
          {selectedFoodGroup === 'All' ? 'All Items' : selectedFoodGroup.replace(/([A-Z])/g, ' $1')}
        </Typography>
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{item.id}</Typography>
                  <Typography>Quantity: {item.quantity}</Typography>
                  <Typography>Category: {item.foodGroup.replace(/([A-Z])/g, ' $1')}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(item)}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<DeleteIcon />} onClick={() => removeItem(item.id)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editItemId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Item Name"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Category"
              fullWidth
              value={selectedFoodGroup}
              onChange={(e) => setSelectedFoodGroup(e.target.value)}
              select
            >
              {Object.keys(foodGroups).map((group) => (
                <MenuItem key={group} value={group}>
                  {group.replace(/([A-Z])/g, ' $1')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              label="Quantity"
              fullWidth
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={editItemId ? editItem : addItem}>
              {editItemId ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default InventoryPage;
