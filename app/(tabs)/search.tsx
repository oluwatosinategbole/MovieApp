import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";

import useFetch from "@/services/usefetch";
import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";

import SearchBar from "@/components/SearchBar";
import MovieDisplayCard from "@/components/MovieCard";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: movies = [],
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();

        if (movies?.length! > 0 && movies?.[0]) {
          await updateSearchCount(searchQuery, movies[0]);
        }
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <FlatList
        data={movies as Movie[]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieDisplayCard {...item} />}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 50 }}
        ListHeaderComponent={
          <>
            <View style={{ marginTop: 40, marginBottom: 20 }}>
              <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
                Search Movies
              </Text>
            </View>

            <SearchBar
              placeholder="Search for a movie"
              value={searchQuery}
              onChangeText={handleSearch}
            />

            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                style={{ marginVertical: 20 }}
              />
            )}

            {error && (
              <Text style={{ color: "red", marginVertical: 10 }}>
                Error: {error.message}
              </Text>
            )}

            {!loading && !error && searchQuery.trim() && movies?.length! > 0 && (
              <Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}>
                Search Results for "{searchQuery}"
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={{ marginTop: 20 }}>
              <Text style={{ textAlign: "center", color: "#555" }}>
                {searchQuery.trim()
                  ? "No movies found"
                  : "Start typing to search for movies"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
