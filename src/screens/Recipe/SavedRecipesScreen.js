import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Heading,
  Icon,
  HStack,
  VStack,
  Image,
  ScrollView,
  Pressable,
  Card,
  CardBody,
  CloseIcon,
  TrashIcon,
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader, 
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  ButtonText,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Center,
  Spinner,
  EmptyIcon
} from '@gluestack-ui/themed';
import { getSavedRecipes, removeRecipe } from '../../services/RecipeService';

export default function SavedRecipesScreen({ navigation, isVisible, onClose }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadSavedRecipes();
    }
  }, [isVisible]);

  const loadSavedRecipes = async () => {
    setLoading(true);
    const savedRecipes = await getSavedRecipes();
    // Sort by most recent first
    savedRecipes.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    setRecipes(savedRecipes);
    setLoading(false);
  };

  const handleDeleteRecipe = async () => {
    if (recipeToDelete) {
      await removeRecipe(recipeToDelete);
      setShowDeleteDialog(false);
      setRecipeToDelete(null);
      loadSavedRecipes();
    }
  };

  const navigateToRecipe = (recipe) => {
    onClose();
    navigation.navigate('Recipe', { item: recipe });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Modal isOpen={isVisible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent bg="$background50" maxHeight="80%">
        <ModalHeader borderBottomWidth={1} borderBottomColor="$gray200">
          <Heading size="lg">Saved Recipes</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} size="lg" color="$gray600" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <Center h={300}>
              <Spinner size="large" color="$primary500" />
              <Text color="$gray600" mt="$2">Loading saved recipes...</Text>
            </Center>
          ) : recipes.length === 0 ? (
            <Center h={300}>
              <Icon as={EmptyIcon} size="6xl" color="$gray300" />
              <Text fontSize="$lg" fontWeight="$semibold" color="$gray600" mt="$4">
                No Saved Recipes
              </Text>
              <Text textAlign="center" mt="$2" color="$gray500">
                Recipes you save from the scanner will appear here
              </Text>
            </Center>
          ) : (
            <ScrollView>
              <VStack space="md" py="$2">
                {recipes.map((recipe) => (
                  <Card key={recipe.recipeId} mb="$3">
                    <CardBody>
                      <Pressable onPress={() => navigateToRecipe(recipe)}>
                        <HStack>
                          <Image
                            source={{ uri: recipe.photo_url }}
                            alt={recipe.title}
                            w={80}
                            h={80}
                            borderRadius="$md"
                          />
                          <VStack ml="$3" flex={1} justifyContent="space-between">
                            <VStack>
                              <Text fontWeight="$bold" fontSize="$md">{recipe.title}</Text>
                              <Text fontSize="$xs" color="$gray600">
                                Saved on {formatDate(recipe.savedAt)}
                              </Text>
                            </VStack>
                            <Pressable
                              onPress={() => {
                                setRecipeToDelete(recipe.recipeId);
                                setShowDeleteDialog(true);
                              }}
                              alignSelf="flex-end"
                              p="$2"
                            >
                              <Icon as={TrashIcon} color="$red500" size="sm" />
                            </Pressable>
                          </VStack>
                        </HStack>
                      </Pressable>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </ScrollView>
          )}
        </ModalBody>
      </ModalContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Remove Recipe</Heading>
            <AlertDialogCloseButton>
              <Icon as={CloseIcon} />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>
              Are you sure you want to remove this recipe from your saved list?
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              action="secondary"
              mr="$3"
              onPress={() => setShowDeleteDialog(false)}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button bg="$red500" action="destructive" onPress={handleDeleteRecipe}>
              <ButtonText>Delete</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Modal>
  );
} 