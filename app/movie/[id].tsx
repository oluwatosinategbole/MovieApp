import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { icons } from "@/constants/icons";
import useFetch from "@/services/usefetch";
import { fetchMovieDetails } from "@/services/api";
import {
  getCurrentUser,
  saveMovieForUser,
  getSavedMovieForUser,
  deleteSavedMovie,
} from "@/services/appwrite";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // On mount / when movie changes, check if current movie is already saved
  useEffect(() => {
    const checkSaved = async () => {
      try {
        const user = await getCurrentUser();
        if (!user || !movie) {
          setUserId(null);
          setSaved(false);
          setSavedDocId(null);
          return;
        }

        setUserId(user.$id);

        const existing = await getSavedMovieForUser(user.$id, movie.id);
        if (existing) {
          setSaved(true);
          setSavedDocId(existing.$id);
        } else {
          setSaved(false);
          setSavedDocId(null);
        }
      } catch (error) {
        console.error("Error checking saved state:", error);
      }
    };

    if (movie) {
      checkSaved();
    }
  }, [movie]);

  if (loading || !movie)
    return (
      <SafeAreaView className="bg-primary flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );

  const handleToggleSave = async () => {
    if (!movie) return;

    try {
      setSaving(true);

      const user = await getCurrentUser();
      if (!user) {
        Alert.alert(
          "Sign in required",
          "Please sign in from the Profile tab before saving movies."
        );
        setSaving(false);
        return;
      }

      // If already saved -> unsave
      if (saved && savedDocId) {
        await deleteSavedMovie(savedDocId);
        setSaved(false);
        setSavedDocId(null);
        Alert.alert("Removed", `"${movie.title}" has been removed from saved.`);
      } else {
        // Not saved yet -> save
        const doc = await saveMovieForUser(user.$id, {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
        });

        setSaved(true);
        setSavedDocId(doc.$id);
        Alert.alert("Saved", `"${movie.title}" has been added to your saved list.`);
      }
    } catch (error) {
      console.error("Error toggling saved state:", error);
      Alert.alert("Error", "Could not update saved state. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />

          <TouchableOpacity className="absolute bottom-5 right-5 rounded-full size-14 bg-white flex items-center justify-center">
            <Image
              source={icons.play}
              className="w-6 h-7 ml-1"
              resizeMode="stretch"
            />
          </TouchableOpacity>
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie.title}</Text>

          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie.release_date?.split("-")[0]} •
            </Text>
            <Text className="text-light-200 text-sm">{movie.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />

            <Text className="text-white font-bold text-sm">
              {Math.round(movie.vote_average ?? 0)}/10
            </Text>

            <Text className="text-light-200 text-sm">
              ({movie.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie.overview} />
          <MovieInfo
            label="Genres"
            value={movie.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${(movie.budget ?? 0) / 1_000_000} million`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(
                (movie.revenue ?? 0) / 1_000_000
              )} million`}
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie.production_companies
                ?.map((c) => c.name)
                .join(" • ") || "N/A"
            }
          />

          {/* SAVE / UNSAVE BUTTON */}
          <TouchableOpacity
            className="mt-6 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center w-full"
            onPress={handleToggleSave}
            disabled={saving}
          >
            <Text className="text-white font-semibold text-base">
              {saving
                ? saved
                  ? "Removing..."
                  : "Saving..."
                : saved
                ? "Remove from saved"
                : "Save movie"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Details;