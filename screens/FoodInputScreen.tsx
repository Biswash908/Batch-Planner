import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useUnit } from '../UnitContext';  // Import the UnitContext

export type Ingredient = {
  name: string;
  meatWeight: number;
  boneWeight: number;
  organWeight: number;
  totalWeight: number;
};

export type RootStackParamList = {
  FoodInputScreen: undefined;
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean };
  SearchScreen: undefined;
  CalculatorScreen: { meat: number; bone: number; organ: number };
};

type FoodInputScreenRouteProp = RouteProp<RootStackParamList, 'FoodInfoScreen'>;

const FoodInputScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<FoodInputScreenRouteProp>();
  const { unit } = useUnit();  // Get the current unit from the context

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [totalMeat, setTotalMeat] = useState(0);
  const [totalBone, setTotalBone] = useState(0);
  const [totalOrgan, setTotalOrgan] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    if (route.params?.updatedIngredient) {
      const newIngredient = route.params.updatedIngredient;
      const existingIngredientIndex = ingredients.findIndex(ing => ing.name === newIngredient.name);

      let updatedIngredients;
      if (existingIngredientIndex !== -1) {
        updatedIngredients = ingredients.map((ing, index) =>
          index === existingIngredientIndex ? newIngredient : ing
        );
      } else {
        updatedIngredients = [...ingredients, newIngredient];
      }

      setIngredients(updatedIngredients);
      calculateTotals(updatedIngredients);
    }
  }, [route.params?.updatedIngredient]);

  const calculateTotals = (updatedIngredients: Ingredient[]) => {
    const totalWt = updatedIngredients.reduce((sum, ing) => sum + ing.totalWeight, 0);
    const meatWeight = updatedIngredients.reduce((sum, ing) => sum + ing.meatWeight, 0);
    const boneWeight = updatedIngredients.reduce((sum, ing) => sum + ing.boneWeight, 0);
    const organWeight = updatedIngredients.reduce((sum, ing) => sum + ing.organWeight, 0);

    setTotalWeight(totalWt);
    setTotalMeat(meatWeight);
    setTotalBone(boneWeight);
    setTotalOrgan(organWeight);
  };

  const handleDeleteIngredient = (name: string) => {
    Alert.alert(
      'Delete Ingredient',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => {
          const updatedIngredients = ingredients.filter(ing => ing.name !== name);
          setIngredients(updatedIngredients);
          calculateTotals(updatedIngredients);
        }}
      ]
    );
  };

  // Helper function to format the weight based on the selected unit
  const formatWeight = (weight: number) => {
    switch (unit) {
      case 'kg':
        return (weight).toFixed(2) + ' kg';
      case 'lbs':
        return (weight).toFixed(2) + ' lbs';
      default:
        return weight.toFixed(2) + ' g';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>Raw Feeding Calculator</Text>
        </View>

        <View style={styles.ingredientsInputBar}>
          <Text style={styles.ingredientsInputText}>Ingredients Input</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
            <FontAwesome name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.totalBar}>
          <Text style={styles.totalText}>
            Total: {formatWeight(totalWeight)}
          </Text>
          <Text style={styles.subTotalText}>
            Meat: {formatWeight(totalMeat)} ({(totalMeat / totalWeight * 100).toFixed(2)}%) | 
            Bone: {formatWeight(totalBone)} ({(totalBone / totalWeight * 100).toFixed(2)}%) | 
            Organ: {formatWeight(totalOrgan)} ({(totalOrgan / totalWeight * 100).toFixed(2)}%)
          </Text>
        </View>

        <ScrollView style={styles.ingredientList}>
          {ingredients.length === 0 ? (
            <Text style={styles.noIngredientsText}>No ingredients added yet</Text>
          ) : (
            ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientText}>{ingredient.name}</Text>
                  <Text style={styles.ingredientDetails}>
                    M: {formatWeight(ingredient.meatWeight)}  B: {formatWeight(ingredient.boneWeight)}  O: {formatWeight(ingredient.organWeight)}
                  </Text>
                  <Text style={styles.totalWeightText}>Total: {formatWeight(ingredient.totalWeight)}</Text>
                </View>
                <View style={styles.iconsContainer}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('FoodInfoScreen', { ingredient, editMode: true })}
                  >
                    <FontAwesome name="edit" size={24} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteIngredient(ingredient.name)}
                  >
                    <FontAwesome name="trash" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={() =>
            navigation.navigate('CalculatorScreen', { meat: totalMeat, bone: totalBone, organ: totalOrgan })}>
          <Text style={styles.calculateButtonText}>Calculate</Text>
        </TouchableOpacity>

        <View style={styles.bottomNav}>
          <TouchableOpacity>
            <FontAwesome name="list" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="home" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  topBar: {
    backgroundColor: '#84DD06',
    paddingVertical: 20,
    alignItems: 'center',
  },
  topBarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  ingredientsInputBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  ingredientsInputText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalBar: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subTotalText: {
    fontSize: 16,
    color: 'black',
  },
  ingredientList: {
    flex: 1,
  },
  noIngredientsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 20,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientText: {
    fontSize: 16,
    marginBottom: 5,
  },
  ingredientDetails: {
    fontSize: 14,
    color: '#555',
  },
  totalWeightText: {
    fontSize: 14,
    color: '#555',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  calculateButton: {
    backgroundColor: '#84DD06',
    borderRadius: 15,
    marginHorizontal: 50,
    paddingVertical: 18,
    marginBottom: 40,
  },
  calculateButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#84DD06',
  },
  bottomNavText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FoodInputScreen;