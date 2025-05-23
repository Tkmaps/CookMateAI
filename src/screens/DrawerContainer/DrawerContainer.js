import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";
import styles from "./styles";
import MenuButton from "../../components/MenuButton/MenuButton";
import { Box, VStack, Divider, Text } from "@gluestack-ui/themed";
import { LinearGradient } from "../../components/ui/linear-gradient";

export default function DrawerContainer(props) {
  const { navigation } = props;
  return (
    <Box flex={1} bg="$background50">
      <LinearGradient
        h={150}
        colors={["#14b8a6", "#0f766e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Box p="$6" justifyContent="flex-end" h="100%">
          <Text color="$white" fontSize="$2xl" fontWeight="$bold">
            CookMate AI
          </Text>
          <Text color="$white" opacity={0.8}>
            Your cooking companion
          </Text>
        </Box>
      </LinearGradient>
      
      <VStack px="$4" py="$6" space="sm">
        <MenuButton
          title="HOME"
          source={require("../../../assets/icons/home.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Home" });
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="CATEGORIES"
          source={require("../../../assets/icons/category.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Categories" });
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="SEARCH"
          source={require("../../../assets/icons/search.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Search" });
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="RECOMMENDATIONS"
          source={require("../../../assets/icons/category.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Recommendations" });
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="MEAL PLANNER"
          source={require("../../../assets/icons/search.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "MealPlanner" });
            navigation.closeDrawer();
          }}
        />
        
        <Divider my="$2" />
        
        <MenuButton
          title="SCAN RECEIPT"
          source={require("../../../assets/icons/category.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "ScanReceipt" });
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="MY PROFILE"
          source={require("../../../assets/icons/search.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Profile" });
            navigation.closeDrawer();
          }}
        />
      </VStack>
    </Box>
  );
}

DrawerContainer.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    closeDrawer: PropTypes.func.isRequired,
  }),
};