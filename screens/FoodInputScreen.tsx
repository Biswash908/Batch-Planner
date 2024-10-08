import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useUnit } from '../UnitContext';

export type Ingredient = {
  name: string;
  meatWeight: number;
  boneWeight: number;
  organWeight: number;
  totalWeight: number;
  unit: 'g' | 'kg' | 'lbs';
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
  const { unit: globalUnit } = useUnit();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [totalMeat, setTotalMeat] = useState(0);
  const [totalBone, setTotalBone] = useState(0);
  const [totalOrgan, setTotalOrgan] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    const newIngredient = route.params?.updatedIngredient;
    if (newIngredient) {
      newIngredient.unit = newIngredient.unit || globalUnit;

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

  const convertToUnit = (weight: number, fromUnit: 'g' | 'kg' | 'lbs', toUnit: 'g' | 'kg' | 'lbs') => {
    if (fromUnit === toUnit) return weight;
    switch (fromUnit) {
      case 'g':
        return toUnit === 'kg' ? weight / 1000 : weight / 453.592;
      case 'kg':
        return toUnit === 'g' ? weight * 1000 : weight * 2.20462;
      case 'lbs':
        return toUnit === 'g' ? weight * 453.592 : weight / 2.20462;
    }
  };

  const calculateTotals = (updatedIngredients: Ingredient[]) => {
    const totalWt = updatedIngredients.reduce((sum, ing) =>
      sum + convertToUnit(ing.totalWeight, ing.unit, globalUnit), 0
    );
    const meatWeight = updatedIngredients.reduce((sum, ing) =>
      sum + convertToUnit(ing.meatWeight, ing.unit, globalUnit), 0
    );
    const boneWeight = updatedIngredients.reduce((sum, ing) =>
      sum + convertToUnit(ing.boneWeight, ing.unit, globalUnit), 0
    );
    const organWeight = updatedIngredients.reduce((sum, ing) =>
      sum + convertToUnit(ing.organWeight, ing.unit, globalUnit), 0
    );

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

  const formatWeight = (weight: number, weightUnit: 'g' | 'kg' | 'lbs') => {
    return weight.toFixed(2) + ' ' + weightUnit;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>

        <View style={styles.totalBar}>
          <Text style={styles.totalText}>
            Total: {formatWeight(isNaN(totalWeight) ? 0 : totalWeight, globalUnit)}
          </Text>
          <Text style={styles.subTotalText}>
            Meat: {formatWeight(totalMeat, globalUnit)} ({totalWeight > 0 ? (totalMeat / totalWeight * 100).toFixed(2) : 0}%) | 
            Bone: {formatWeight(totalBone, globalUnit)} ({totalWeight > 0 ? (totalBone / totalWeight * 100).toFixed(2) : 0}%) | 
            Organ: {formatWeight(totalOrgan, globalUnit)} ({totalWeight > 0 ? (totalOrgan / totalWeight * 100).toFixed(2) : 0}%)
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {ingredients.length === 0 ? (
            <Text style={styles.noIngredientsText}>No ingredients added yet</Text>
          ) : (
            ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientText}>{ingredient.name}</Text>
                  <Text style={styles.ingredientDetails}>
                    M: {formatWeight(ingredient.meatWeight, ingredient.unit)}  B: {formatWeight(ingredient.boneWeight, ingredient.unit)}  O: {formatWeight(ingredient.organWeight, ingredient.unit)}
                  </Text>
                  <Text style={styles.totalWeightText}>Total: {formatWeight(isNaN(ingredient.totalWeight) ? 0 : ingredient.totalWeight, ingredient.unit)}</Text>
                </View>
                <View style={styles.iconsContainer}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('FoodInfoScreen', {
                      ingredient: { ...ingredient, unit: ingredient.unit }, // Pass the current unit
                      editMode: true
                    })}>
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

        <View style={styles.calculateButtonContainer}>
          <TouchableOpacity
            style={styles.ingredientButton}
            onPress={() => navigation.navigate('SearchScreen')}>
            <Text style={styles.ingredientButtonText}>Add Ingredients</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={() =>
              navigation.navigate('CalculatorScreen', { meat: totalMeat, bone: totalBone, organ: totalOrgan })}>
            <Text style={styles.calculateButtonText}>Select Ratio & Calculate</Text>
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
    backgroundColor: 'transparent', // Ensure the parent container has a transparent background
  },
  topBar: {
    backgroundColor: '#000080',
    paddingVertical: 25,
    alignItems: 'center',
  },
  topBarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  totalBar: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ded8d7',
    backgroundColor: 'white',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  subTotalText: {
    fontSize: 16,
    color: 'black',
  },
  scrollContainer: {
    padding: 10,
    paddingBottom: 5, // Extra space for bottom navigation bar
  },
  noIngredientsText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 50,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  ingredientDetails: {
    fontSize: 16,
    color: '#404040',
    marginVertical: 5,
  },
  totalWeightText: {
    fontSize: 16,
    color: '#404040',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  editButton: {
    marginRight: 20,
  },
  deleteButton: {
    padding: 5,
  },
  calculateButtonContainer: {
    padding: 20,
    borderTopWidth: 0.7,
    borderTopColor: '#ded8d7',
    backgroundColor: 'white',
    paddingBottom: 10,
  },
  ingredientButton: {
    backgroundColor: '#000080',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  ingredientButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  calculateButton: {
    backgroundColor: '#000080',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  calculateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000080',
    paddingVertical: 5,
  },
  bottomBarItem: {
    alignItems: 'center',

  },
  bottomBarText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 1,
  },
});

export default FoodInputScreen;