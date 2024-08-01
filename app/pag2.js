"use client";
import { firestore } from "@/firebase";
import {
  Box,
  Modal,
  Stack,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  query,
  getDocs,
  setDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  //for filter query
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query) {
      setFilteredInventory(
        inventory.filter(({ name }) => name.toLowerCase().includes(query))
      );
    } else {
      setFilteredInventory(inventory);
    }
  };

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
      await updateInventory(); // Refresh inventory after removal
    }
  };

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    await deleteDoc(docRef);
    await updateInventory(); // Refresh inventory after deletion
  };

  const updateItemName = async () => {
    if (!currentItem || !itemName) return;

    const oldDocRef = doc(collection(firestore, "inventory"), currentItem.name);
    const newDocRef = doc(collection(firestore, "inventory"), itemName);

    const oldDocSnap = await getDoc(oldDocRef);
    const newDocSnap = await getDoc(newDocRef);

    if (oldDocSnap.exists()) {
      const { quantity } = oldDocSnap.data();

      if (newDocSnap.exists()) {
        // If the new name already exists, add the quantities together
        const { quantity: newQuantity } = newDocSnap.data();
        await setDoc(newDocRef, { quantity: quantity + newQuantity });
      } else {
        // Otherwise, just set the new doc with the old quantity
        await setDoc(newDocRef, { quantity });
      }

      // Delete the old document
      await deleteDoc(oldDocRef);

      // Clear the input fields and close the modal
      setCurrentItem(null);
      setItemName("");
      setUpdateOpen(false);

      // Refresh the inventory
      await updateInventory();
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleUpdateOpen = (item) => {
    setCurrentItem(item);
    setItemName(item.name);
    setUpdateOpen(true);
  };
  const handleUpdateClose = () => {
    setCurrentItem(null);
    setItemName("");
    setUpdateOpen(false);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Box width="800px" mb={2}>
        <TextField
          label="Search Items"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%,-50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
            }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              addItem(itemName);
              setItemName("");
              handleClose();
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>

      <Modal open={updateOpen} onClose={handleUpdateClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%,-50%)",
          }}
        >
          <Typography variant="h6">Update Item Name</Typography>
          <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
            }}
          />
          <Button variant="outlined" onClick={updateItemName}>
            Update
          </Button>
        </Box>
      </Modal>

      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Box border="1px solid #333">
        <Box
          width="800px"
          height="100px"
          bgcolor="#e6bbad"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h2" color="#333" textAlign="center">
            Inventory Items
          </Typography>
        </Box>

        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="72bcd4"
              padding={5}
            >
              <Typography variant="h3" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Stack direction="row" spacing={20}>
                <Typography variant="h3" color="#333" textAlign="center">
                  <Button variant="contained" onClick={() => removeItem(name)}>
                    -
                  </Button>
                  {quantity}
                  <Button variant="contained" onClick={() => addItem(name)}>
                    +
                  </Button>
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                {/* <Button variant="contained" onClick={() => addItem(name)}>
                  +
                </Button>
                <Button variant="contained" onClick={() => removeItem(name)}>
                  -
                </Button> */}
                <Button
                  variant="contained"
                  onClick={() => handleUpdateOpen({ name, quantity })}
                >
                  Update
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => deleteItem(name)}
                >
                  Delete
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
