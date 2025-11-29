import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { Link, useFocusEffect } from "expo-router";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import {
  getCurrentUser,
  getSavedMoviesForUser,
  SavedMovie,
} from "@/services/appwrite";

const Save = () => {
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const loadSavedMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await getCurrentUser();

      if (!user) {
        setIsLoggedIn(false);
        setSavedMovies([]);
        return;
      }

      setIsLoggedIn(true);

      const movies = await getSavedMoviesForUser(user.$id);
      setSavedMovies(movies);
    } catch (err) {
      console.error("Error fetching saved movies:", err);
      setError("Could not load saved movies.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔑 This runs every time the Save tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedMovies();
    }, [loadSavedMovies])
  );

  const renderMovie = ({ item }: { item: SavedMovie }) => (
    <Link href={`/movie/${item.movie_id}`} asChild>
      <TouchableOpacity className="w-[30%] mb-5">
        <Image
          source={{
            uri:
              item.poster_url ||
              "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
          }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />
        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-xs text-light-300 font-medium mt-1">
          {item.release_date?.split("-")[0] || "N/A"}
        </Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView className="bg-primary flex-1">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <View className="flex-1 px-5 pt-16">
        <View className="flex-row items-center gap-x-3 mb-5">
          <Image source={icons.save} className="w-6 h-6" tintColor="#fff" />
          <Text className="text-white text-xl font-bold">Saved Movies</Text>
        </View>

        {loading && (
          <ActivityIndicator size="large" color="#ffffff" className="mt-10" />
        )}

        {!loading && isLoggedIn === false && (
          <Text className="text-light-300 mt-5">
            Please sign in from the Profile tab to view your saved movies.
          </Text>
        )}

        {!loading && isLoggedIn && error && (
          <Text className="text-red-400 mt-5">{error}</Text>
        )}

        {!loading &&
          isLoggedIn &&
          !error &&
          savedMovies.length === 0 && (
            <Text className="text-light-300 mt-5">
              You don’t have any saved movies yet. Open a movie and tap "Save
              movie" to add it here.
            </Text>
          )}

        {!loading &&
          isLoggedIn &&
          !error &&
          savedMovies.length > 0 && (
            <FlatList
              data={savedMovies}
              keyExtractor={(item) => item.$id}
              renderItem={renderMovie}
              numColumns={3}
              columnWrapperStyle={{
                justifyContent: "flex-start",
                gap: 20,
              }}
              contentContainerStyle={{ paddingBottom: 40, marginTop: 10 }}
            />
          )}
      </View>
    </SafeAreaView>
  );
};

export default Save;