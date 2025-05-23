import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  ScrollView,
  HStack,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  Button,
  ButtonText,
  Icon,
  Divider,
  Pressable,
  ChevronRightIcon,
} from "@gluestack-ui/themed";
import { LinearGradient } from "../../components/ui/linear-gradient";
import { ScanIcon, PlusIcon } from "@gluestack-ui/themed";

// Mock grocery data
const mockGroceryItems = {
  Produce: [
    { id: 1, name: "Tomatoes", quantity: "4 medium", isChecked: false },
    { id: 2, name: "Lettuce", quantity: "1 head", isChecked: false },
    { id: 3, name: "Carrots", quantity: "500g", isChecked: true },
    { id: 4, name: "Bell Peppers", quantity: "2", isChecked: false },
    { id: 5, name: "Onions", quantity: "3", isChecked: true },
  ],
  Dairy: [
    { id: 6, name: "Cheese", quantity: "200g", isChecked: false },
    { id: 7, name: "Yogurt", quantity: "500g", isChecked: true },
    { id: 8, name: "Milk", quantity: "1L", isChecked: false },
  ],
  Pantry: [
    { id: 9, name: "Rice", quantity: "1kg", isChecked: false },
    { id: 10, name: "Pasta", quantity: "500g", isChecked: true },
    { id: 11, name: "Canned tomatoes", quantity: "2 cans", isChecked: false },
    { id: 12, name: "Olive Oil", quantity: "1 bottle", isChecked: false },
  ],
};

export default function GroceryListScreen({ navigation }) {
  const [groceryItems, setGroceryItems] = useState(mockGroceryItems);

  const toggleItemCheck = (category, id) => {
    setGroceryItems({
      ...groceryItems,
      [category]: groceryItems[category].map(item => 
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    });
  };

  const navigateToScanReceipt = () => {
    navigation.navigate("ScanReceipt");
  };

  return (
    <Box flex={1} bg="$background50">
      <LinearGradient
        h={150}
        colors={["#14b8a6", "#0f766e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Box p="$4" justifyContent="flex-end" h="100%">
          <Heading color="$white" size="xl">
            Grocery List
          </Heading>
          <Text color="$white" opacity={0.8}>
            Manage your shopping items
          </Text>
        </Box>
      </LinearGradient>

      <ScrollView flex={1}>
        <VStack space="md" width="100%" p="$4">
          {/* Scan Receipt Button */}
          <Pressable onPress={navigateToScanReceipt}>
            <HStack 
              bg="$white" 
              p="$4" 
              borderRadius="$lg" 
              alignItems="center" 
              justifyContent="space-between"
              shadowColor="$gray400"
              shadowOpacity={0.2}
              shadowRadius={3}
              elevation={3}
            >
              <HStack alignItems="center" space="md">
                <Icon as={ScanIcon} size="lg" color="$primary500" />
                <Text fontWeight="$semibold" fontSize="$md">Scan Receipt to Add Items</Text>
              </HStack>
              <ChevronRightIcon size="sm" color="$gray400" />
            </HStack>
          </Pressable>

          {/* Grocery Categories */}
          {Object.keys(groceryItems).map((category) => (
            <Box 
              key={category}
              bg="$white"
              p="$4"
              borderRadius="$lg"
              shadowColor="$gray400"
              shadowOpacity={0.2}
              shadowRadius={3}
              elevation={3}
              mb="$4"
            >
              <HStack justifyContent="space-between" alignItems="center" mb="$2">
                <Heading size="md">{category}</Heading>
                <Button variant="outline" size="sm" borderColor="$primary500">
                  <Icon as={PlusIcon} color="$primary500" size="sm" mr="$1" />
                  <ButtonText color="$primary500">Add</ButtonText>
                </Button>
              </HStack>
              
              <Divider mb="$3" />
              
              <VStack space="md">
                {groceryItems[category].map((item) => (
                  <HStack key={item.id} justifyContent="space-between" alignItems="center">
                    <Checkbox
                      value={item.name}
                      isChecked={item.isChecked}
                      onChange={() => toggleItemCheck(category, item.id)}
                      size="md"
                    >
                      <CheckboxIndicator mr="$2">
                        <CheckboxIcon />
                      </CheckboxIndicator>
                      <CheckboxLabel>
                        <Text 
                          fontWeight="$medium" 
                          textDecorationLine={item.isChecked ? "line-through" : "none"}
                          color={item.isChecked ? "$gray400" : "$gray800"}
                        >
                          {item.name}
                        </Text>
                      </CheckboxLabel>
                    </Checkbox>
                    <Text color="$gray600">{item.quantity}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
} 