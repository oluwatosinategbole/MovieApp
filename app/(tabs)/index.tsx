import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Button,
} from "react-native";
import { useRouter } from "expo-router";

import useFetch from "@/services/usefetch";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";

import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";

const Index = () => {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
          Movie App
        </Text>

        {moviesLoading || trendingLoading ? (
          <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
        ) : moviesError || trendingError ? (
          <Text style={{ color: "red", marginTop: 10 }}>
            Error: {moviesError?.message || trendingError?.message}
          </Text>
        ) : (
          <View style={{ marginTop: 20 }}>
            <SearchBar
              onPress={() => {
                router.push("/search");
              }}
              placeholder="Search for a movie"
            />

            {trendingMovies && (
              <View style={{ marginTop: 30 }}>
                <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
                  Trending Movies
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={trendingMovies}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}
                />
              </View>
            )}

            <View style={{ marginTop: 30 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
                Latest Movies
              </Text>

              <FlatList
                data={movies}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                scrollEnabled={false}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Index;
