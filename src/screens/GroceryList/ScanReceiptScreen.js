import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Image,
  ScrollView,
  Center,
  HStack,
  Input,
  InputField,
  IconButton,
  CloseIcon,
  AddIcon,
  Spinner,
  Toast,
  ToastTitle,
  ToastDescription,
  useToast,
} from "@gluestack-ui/themed";
import { LinearGradient } from "../../components/ui/linear-gradient";
import { Platform, TouchableOpacity, Modal } from "react-native";
import CameraComponent from "../../components/Camera/CameraComponent";

// Mock OCR function (in a real app, this would connect to an OCR service)
const extractTextFromImage = (imageUri) => {
  // This is a mock of what an OCR service would do
  // In a real app, you'd use something like Google Cloud Vision API, 
  // Microsoft Computer Vision, or Tesseract.js
  
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Return mock data - in a real app, this would be the OCR results
      const mockItems = [
        { name: "Organic Tomatoes", price: "$2.99" },
        { name: "Chicken Breast", price: "$6.49" },
        { name: "Pasta", price: "$1.99" },
        { name: "Basil", price: "$1.29" },
        { name: "Parmesan", price: "$4.59" },
        { name: "Olive Oil", price: "$8.99" },
      ];
      resolve(mockItems);
    }, 2000);
  });
};

export default function ScanReceiptScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [groceryItems, setGroceryItems] = useState([
    { id: 1, name: "Tomatoes", isConfirmed: true },
    { id: 2, name: "Chicken Breast", isConfirmed: true },
    { id: 3, name: "Olive Oil", isConfirmed: true },
  ]);
  const [newItem, setNewItem] = useState("");
  const toast = useToast();

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
  };

  const handlePhotoTaken = async (photoUri) => {
    setIsCameraOpen(false);
    setImage(photoUri);
    
    // Perform OCR on the image
    setIsScanning(true);
    try {
      const extractedItems = await extractTextFromImage(photoUri);
      
      // Add detected items to the grocery list
      const newItems = extractedItems.map((item, index) => ({
        id: Math.random(), // In a real app, use a proper unique ID
        name: item.name,
        price: item.price,
        isConfirmed: false,
      }));
      
      setGroceryItems([...groceryItems, ...newItems]);
      
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="success" variant="solid">
              <VStack space="xs">
                <ToastTitle>Receipt Scanned</ToastTitle>
                <ToastDescription>
                  {newItems.length} items found. Please confirm each item.
                </ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    } catch (error) {
      console.error("Error in OCR process:", error);
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="error" variant="solid">
              <VStack space="xs">
                <ToastTitle>Error</ToastTitle>
                <ToastDescription>
                  Could not scan receipt. Please try again.
                </ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setGroceryItems([
        ...groceryItems,
        { id: Math.random(), name: newItem, isConfirmed: true },
      ]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (id) => {
    setGroceryItems(groceryItems.filter(item => item.id !== id));
  };

  const handleConfirmItem = (id) => {
    setGroceryItems(
      groceryItems.map(item => 
        item.id === id ? { ...item, isConfirmed: true } : item
      )
    );
  };

  const handleSaveList = () => {
    // Save confirmed items to the database
    const confirmedItems = groceryItems.filter(item => item.isConfirmed);
    console.log("Saving items:", confirmedItems);
    // Navigate back or to recipes
    navigation.navigate("Home");
  };

  return (
    <Box flex={1} bg="$background50">
      <LinearGradient
        h={120}
        colors={["#14b8a6", "#0f766e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Box p="$4" justifyContent="center" h="100%">
          <Heading color="$white" size="xl">
            Scan Receipt
          </Heading>
          <Text color="$white" opacity={0.8}>
            Capture your grocery receipt to add items
          </Text>
        </Box>
      </LinearGradient>

      {/* Camera Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isCameraOpen}
        onRequestClose={handleCloseCamera}
      >
        <CameraComponent
          onPhotoTaken={handlePhotoTaken}
          onClose={handleCloseCamera}
        />
      </Modal>

      <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
        <VStack space="md" width="100%">
          {!image ? (
            <Box
              bg="$white"
              p="$6"
              borderRadius="$lg"
              shadowColor="$gray400"
              shadowOpacity={0.2}
              shadowRadius={3}
              elevation={3}
              alignItems="center"
            >
              <TouchableOpacity onPress={handleOpenCamera}>
                <Box
                  bg="$gray100"
                  h={200}
                  w={280}
                  borderRadius="$md"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text color="$gray500">Tap to take a photo</Text>
                </Box>
              </TouchableOpacity>
              <Button onPress={handleOpenCamera} mt="$4" bg="$primary500">
                <ButtonText>Open Camera</ButtonText>
              </Button>
            </Box>
          ) : (
            <Box
              bg="$white"
              p="$4"
              borderRadius="$lg"
              shadowColor="$gray400"
              shadowOpacity={0.2}
              shadowRadius={3}
              elevation={3}
            >
              <Image
                source={{ uri: image }}
                h={300}
                w="100%"
                borderRadius="$md"
                alt="Receipt"
              />
              {isScanning && (
                <Center position="absolute" top={0} left={0} right={0} bottom={0}>
                  <Box bg="rgba(0,0,0,0.7)" p="$4" borderRadius="$md">
                    <VStack space="md" alignItems="center">
                      <Spinner size="large" color="$white" />
                      <Text color="$white">Scanning receipt...</Text>
                    </VStack>
                  </Box>
                </Center>
              )}
              <Button onPress={handleOpenCamera} mt="$4" bg="$primary500">
                <ButtonText>Retake Photo</ButtonText>
              </Button>
            </Box>
          )}

          <Box
            bg="$white"
            p="$4"
            borderRadius="$lg"
            shadowColor="$gray400"
            shadowOpacity={0.2}
            shadowRadius={3}
            elevation={3}
          >
            <Heading size="md" mb="$4">
              Grocery Items
            </Heading>

            <HStack space="md" mb="$4" alignItems="center">
              <Input flex={1}>
                <InputField
                  placeholder="Add an item"
                  value={newItem}
                  onChangeText={setNewItem}
                />
              </Input>
              <Button onPress={handleAddItem} bg="$primary500">
                <ButtonText>Add</ButtonText>
              </Button>
            </HStack>

            <VStack space="sm" width="100%">
              {groceryItems.length > 0 ? (
                groceryItems.map((item) => (
                  <HStack
                    key={item.id}
                    bg={item.isConfirmed ? "$white" : "$yellow100"}
                    p="$3"
                    borderRadius="$md"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <VStack>
                      <Text fontWeight={item.isConfirmed ? "$normal" : "$bold"}>{item.name}</Text>
                      {item.price && <Text color="$gray600" fontSize="$sm">{item.price}</Text>}
                    </VStack>
                    <HStack space="sm">
                      {!item.isConfirmed && (
                        <Button
                          size="xs"
                          onPress={() => handleConfirmItem(item.id)}
                          bg="$green500"
                        >
                          <ButtonText>Confirm</ButtonText>
                        </Button>
                      )}
                      <IconButton
                        size="sm"
                        onPress={() => handleRemoveItem(item.id)}
                        icon={<CloseIcon size="sm" color="$red500" />}
                      />
                    </HStack>
                  </HStack>
                ))
              ) : (
                <Center p="$4">
                  <Text color="$gray500">No items added yet</Text>
                </Center>
              )}
            </VStack>
          </Box>

          <Button
            mt="$4"
            mb="$8"
            bg="$primary500"
            onPress={handleSaveList}
          >
            <ButtonText>Save Grocery List</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </Box>
  );
} 