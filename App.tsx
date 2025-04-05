import React, { useCallback, useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Text, View, Platform, Dimensions } from "react-native"
import * as SplashScreen from "expo-splash-screen"
import FontAwesome6 from "react-native-vector-icons/FontAwesome6"
import RecipeContentScreen from "./screens/RecipeContentScreen"
import RecipeFoodInfoScreen from "./screens/RecipeFoodInfoScreen"
import RecipeSearchScreen from "./screens/RecipeSearchScreen"
import FoodInputScreen from "./screens/FoodInputScreen"
import FoodInfoScreen from "./screens/FoodInfoScreen"
import SearchScreen from "./screens/SearchScreen"
import CalculatorScreen from "./screens/CalculatorScreen"
import InfoAndSupportScreen from "./screens/InfoAndSupportScreen" // Merged screen
import RecipeScreen from "./screens/RecipeScreen" // Recipe screen
import CustomRatioScreen from "./screens/CustomRatioScreen"
import FAQScreen from "./screens/FAQScreen"
import RawFeedingFAQScreen from "./screens/RawFeedingFAQScreen"
import { UnitProvider } from "./UnitContext"
import { SaveProvider } from "./SaveContext"

SplashScreen.preventAutoHideAsync()

// Add responsive sizing utilities
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const isSmallDevice = SCREEN_WIDTH < 375
const isIOS = Platform.OS === "ios"
const scale = SCREEN_WIDTH / 375
const rs = (size: number) => Math.round(size * (isIOS ? Math.min(scale, 1.2) : scale))

// Define the stack's parameter list
export type RootStackParamList = {
  FoodInputScreen: { fromRecipe?: boolean } // Added fromRecipe param
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean }
  SearchScreen: undefined
  CalculatorScreen: { meat: number; bone: number; organ: number }
  FAQScreen: undefined
}

const Stack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

// Bottom Tab Navigator (Home, Info & Support, Recipe)
const HomeTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName
          let label

          if (route.name === "Home") {
            iconName = "house"
            label = "Home"
          } else if (route.name === "InfoAndSupport") {
            iconName = "gear"
            label = "Support"
          } else if (route.name === "Recipe") {
            iconName = "book"
            label = "Recipes"
          }

          return (
            <View style={{ 
              alignItems: "center", 
              justifyContent: "center", 
              height: isIOS ? (isSmallDevice ? 30 : 40) : (isSmallDevice ? 40 : 50) 
            }}>
              <FontAwesome6
                name={iconName}
                size={isIOS ? (isSmallDevice ? 18 : 24) : (isSmallDevice ? 22 : 26)} //Bottom nav bar icons
                color={"white"}
                style={{ textAlign: "center" }}
              />
              <Text style={{ 
                color: "white", 
                fontSize: isIOS ? (isSmallDevice ? 8 : 10) : (isSmallDevice ? 10 : 12), //Bottom nav bar text
                marginTop: isIOS && isSmallDevice ? 0 : 0
              }}>
                {label}
              </Text>
            </View>
          )
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#000080",
          paddingVertical: isIOS ? (isSmallDevice ? 0 : 3) : (isSmallDevice ? 2 : 5),
          height: isIOS ? (isSmallDevice ? 40 : 50) : (isSmallDevice ? 45 : 55), //Bottom nav bar height
        },
      })}
    >
      <Tab.Screen
        name="InfoAndSupport"
        component={InfoAndSupportScreen}
        options={{
          title: "Support",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "white",
            height: isIOS && isSmallDevice ? 60 : undefined,
          },
          headerTitleStyle: {
            fontSize: isIOS ? (isSmallDevice ? 16 : 22) : rs(isSmallDevice ? 18 : 25),
            fontWeight: "600",
            color: "black",
          },
        }}
      />
      <Tab.Screen name="Home" component={FoodInputScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Recipe"
        component={RecipeScreen}
        options={{
          title: "Recipes",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "white",
            height: isIOS && isSmallDevice ? 60 : undefined,
          },
          headerTitleStyle: {
            fontSize: isIOS ? (isSmallDevice ? 16 : 22) : rs(isSmallDevice ? 18 : 25),
            fontWeight: "600",
            color: "black",
          },
        }}
      />
    </Tab.Navigator>
  )
}

const App: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    const prepare = async () => {
      try {
        // Simulate a delay (e.g., 2 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000))
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null // Don't render until ready
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
    <UnitProvider>
      <SaveProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="HomeTabs"
            screenOptions={{
              headerTitleStyle: {
                fontSize: isIOS ? (isSmallDevice ? 16 : 20) : rs(isSmallDevice ? 18 : 22),
                fontWeight: "600",
                color: "black",
              },
              headerTitleAlign: "center",
              headerStyle: {
                height: isIOS && isSmallDevice ? 60 : undefined,
              },
              // Add this to customize the back button text
              headerBackTitle: "Back",
              // If you want no text, use this instead:
              // headerBackTitle: " ",
            }}
          >
            <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
            <Stack.Screen name="FoodInfoScreen" component={FoodInfoScreen} options={{ title: "Food Information" }} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ title: "Search Ingredients" }} />
            <Stack.Screen
              name="RecipeFoodInfoScreen"
              component={RecipeFoodInfoScreen}
              options={{ title: "Food Information" }}
            />
            <Stack.Screen
              name="RecipeSearchScreen"
              component={RecipeSearchScreen}
              options={{ title: "Search Ingredients" }}
            />
            <Stack.Screen name="CalculatorScreen" component={CalculatorScreen} />
            <Stack.Screen name="RecipeContentScreen" component={RecipeContentScreen} />
            <Stack.Screen name="CustomRatioScreen" component={CustomRatioScreen} options={{ title: "Custom Ratio" }} />
            <Stack.Screen name="InfoAndSupportScreen" component={InfoAndSupportScreen} />
            <Stack.Screen name="RecipeScreen" component={RecipeScreen} />

            <Stack.Screen name="FAQScreen" component={FAQScreen} options={{ title: "App FAQs" }} />
            <Stack.Screen
              name="RawFeedingFAQScreen"
              component={RawFeedingFAQScreen}
              options={{ title: "Raw Feeding FAQs" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SaveProvider>
    </UnitProvider>
    </View>
  )
}

export default App