import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import useFetch from "@/services/usefetch";
import { fetchMovieDetails } from "@/services/api";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View style={{ marginTop: 10 }}>
    <Text style={{ fontSize: 14, fontWeight: "500" }}>{label}</Text>
    <Text style={{ fontSize: 14, marginTop: 4 }}>{value || "N/A"}</Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {movie?.poster_path && (
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            style={{
              width: "100%",
              height: 400,
              marginBottom: 20,
              borderRadius: 4,
            }}
            resizeMode="cover"
          />
        )}

        <Text style={{ fontSize: 20, fontWeight: "700" }}>{movie?.title}</Text>

        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <Text style={{ fontSize: 14 }}>
            {movie?.release_date?.split("-")[0]}
          </Text>
          <Text style={{ fontSize: 14, marginLeft: 8 }}>
            {movie?.runtime} mins
          </Text>
        </View>

        <MovieInfo
          label="Rating"
          value={
            movie?.vote_average
              ? `${Math.round(movie.vote_average)}/10 (${movie.vote_count} votes)`
              : "N/A"
          }
        />
        <MovieInfo label="Overview" value={movie?.overview} />
        <MovieInfo
          label="Genres"
          value={movie?.genres?.map((g) => g.name).join(", ") || "N/A"}
        />

        <MovieInfo
          label="Budget"
          value={
            movie?.budget ? `$${(movie.budget / 1_000_000).toFixed(1)} million` : "N/A"
          }
        />
        <MovieInfo
          label="Revenue"
          value={
            movie?.revenue
              ? `$${(movie.revenue / 1_000_000).toFixed(1)} million`
              : "N/A"
          }
        />
        <MovieInfo
          label="Production Companies"
          value={
            movie?.production_companies
              ?.map((c) => c.name)
              .join(", ") || "N/A"
          }
        />

        <TouchableOpacity
          style={{
            marginTop: 30,
            paddingVertical: 12,
            alignItems: "center",
            borderWidth: 1,
            borderRadius: 4,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Details;
